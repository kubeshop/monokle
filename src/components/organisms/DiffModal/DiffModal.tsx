import * as k8s from '@kubernetes/client-node';

import {LegacyRef, useEffect, useMemo, useState} from 'react';
import {MonacoDiffEditor} from 'react-monaco-editor';
import {ResizableBox} from 'react-resizable';
import {useMeasure} from 'react-use';

import {Button, Modal, Skeleton, Switch, Tag} from 'antd';

import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

import styled from 'styled-components';
import {stringify} from 'yaml';

import {makeApplyKustomizationText, makeApplyResourceText} from '@constants/makeApplyText';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeResourceDiffModal, openResourceDiffModal, updateResource} from '@redux/reducers/main';
import {isKustomizationResource} from '@redux/services/kustomize';
import {applyResource} from '@redux/thunks/applyResource';

import Icon from '@components/atoms/Icon';
import ModalConfirmWithNamespaceSelect from '@components/molecules/ModalConfirmWithNamespaceSelect';

import {useWindowSize} from '@utils/hooks';
import {KUBESHOP_MONACO_THEME} from '@utils/monaco';
import {removeIgnoredPathsFromResourceContent} from '@utils/resources';

import Colors from '@styles/Colors';

import {getResourceKindHandler} from '@src/kindhandlers';

const StyledModal = styled(Modal)`
  .ant-modal-close {
    color: ${Colors.grey700};
  }
  .ant-modal-header {
    background-color: ${Colors.grey1000};
    border-bottom: 1px solid ${Colors.grey900};
  }
  .ant-modal-body {
    background-color: ${Colors.grey1000};
    padding: 0px;
  }
  .ant-modal-footer {
    background-color: ${Colors.grey1000};
    border-top: 1px solid ${Colors.grey900};
    padding: 8px;
  }

  & .custom-modal-handle {
    position: absolute;
    top: 50%;
    height: 100%;
    width: 10px;
    background-color: transparent;
    cursor: col-resize;
    transform: translateY(-50%);
  }

  & .custom-modal-handle-e {
    right: -5px;
  }

  & .custom-modal-handle-w {
    left: -5px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 12px;
`;

const MonacoDiffContainer = styled.div<{height: string; width: string}>`
  ${props => `
    height: ${props.height};
    width: ${props.width};
  `}
  padding: 8px;
  & .monaco-editor .monaco-editor-background {
    background-color: ${Colors.grey1000} !important;
  }
  & .monaco-editor .margin {
    background-color: ${Colors.grey1000} !important;
  }
  & .diffOverview {
    background-color: ${Colors.grey1000} !important;
  }
`;

const SwitchContainer = styled.span`
  display: flex;
  justify-content: center;
  padding-top: 16px;
  padding-bottom: 0;
`;

const StyledSwitchLabel = styled.span`
  margin-left: 8px;
  cursor: pointer;
`;

const TagsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  padding-bottom: 5px;
`;

const StyledTag = styled(Tag)`
  padding: 5px 10px;
  font-size: 14px;
  font-weight: 600;
`;

const DiffModal = () => {
  const dispatch = useAppDispatch();

  const currentContext = useAppSelector(state => state.config.kubeConfig.currentContext);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const isDiffModalVisible = useAppSelector(state => Boolean(state.main.resourceDiff.targetResourceId));
  const kubeconfigPath = useAppSelector(state => state.config.kubeconfigPath);
  const kubeconfigContext = useAppSelector(state => state.config.kubeConfig.currentContext);
  const previewType = useAppSelector(state => state.main.previewType);
  const resourceFilter = useAppSelector(state => state.main.resourceFilter);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const targetResource = useAppSelector(state =>
    state.main.resourceDiff.targetResourceId
      ? state.main.resourceMap[state.main.resourceDiff.targetResourceId]
      : undefined
  );

  const [containerRef, {height: containerHeight, width: containerWidth}] = useMeasure<HTMLDivElement>();

  const [hasDiffModalLoaded, setHasDiffModalLoaded] = useState(false);
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [matchingResourcesById, setMatchingResourcesById] = useState<Record<string, any>>();
  const [matchingResourceText, setMatchingResourceText] = useState<string>();
  const [namespaces, setNamespaces] = useState<string[]>();
  const [shouldDiffIgnorePaths, setShouldDiffIgnorePaths] = useState<boolean>(true);
  const [selectedMatchingResourceId, setSelectedMathingResourceId] = useState<string>();
  const [targetResourceText, setTargetResourceText] = useState<string>();

  const windowSize = useWindowSize();

  const resizableBoxHeight = useMemo(() => windowSize.height * (75 / 100), [windowSize.height]);
  const resizableBoxWidth = useMemo(() => {
    const vwValue = windowSize.width < 1200 ? 95 : 80;
    return windowSize.width * (vwValue / 100);
  }, [windowSize.width]);

  const options = {
    readOnly: true,
    renderSideBySide: true,
    minimap: {
      enabled: false,
    },
  };

  const confirmModalTitle = useMemo(() => {
    if (!targetResource) {
      return '';
    }

    return isKustomizationResource(targetResource)
      ? makeApplyKustomizationText(targetResource.name, kubeconfigContext)
      : makeApplyResourceText(targetResource.name, kubeconfigContext);
  }, [targetResource, kubeconfigContext]);

  const onClickApplyResource = (namespace?: string) => {
    if (targetResource?.id) {
      const resource = resourceMap[targetResource.id];
      if (resource) {
        applyResource(resource.id, resourceMap, fileMap, dispatch, kubeconfigPath, kubeconfigContext || '', namespace, {
          isClusterPreview: previewType === 'cluster',
          shouldPerformDiff: true,
        });
      }
    }
    setIsApplyModalVisible(false);
  };

  const handleApply = () => {
    if (targetResource?.id) {
      setIsApplyModalVisible(true);
    }
  };

  const onCloseHandler = () => {
    dispatch(closeResourceDiffModal());
  };

  const handleRefresh = () => {
    if (targetResource?.id) {
      dispatch(openResourceDiffModal(targetResource.id));
    }
  };

  const handleReplace = () => {
    if (!targetResource || !shouldDiffIgnorePaths || !cleanMatchingResourceText) {
      return;
    }

    dispatch(
      updateResource({
        resourceId: targetResource.id,
        content: cleanMatchingResourceText,
        preventSelectionAndHighlightsUpdate: true,
      })
    );
  };

  const cleanMatchingResourceText = useMemo(() => {
    if (!matchingResourceText || !targetResource?.content || !selectedMatchingResourceId || !matchingResourcesById) {
      return undefined;
    }

    if (!shouldDiffIgnorePaths) {
      return matchingResourceText;
    }

    const newDiffContentObject = removeIgnoredPathsFromResourceContent(
      matchingResourcesById[selectedMatchingResourceId]
    );
    const cleanDiffContentString = stringify(newDiffContentObject, {sortMapEntries: true});
    return cleanDiffContentString;
  }, [matchingResourcesById, matchingResourceText, selectedMatchingResourceId, shouldDiffIgnorePaths, targetResource]);

  const areResourcesDifferent = useMemo(() => {
    return targetResourceText !== cleanMatchingResourceText;
  }, [targetResourceText, cleanMatchingResourceText]);

  useEffect(() => {
    if (!targetResource || !resourceMap) {
      return;
    }

    const getClusterResources = async () => {
      const kc = new k8s.KubeConfig();
      kc.loadFromFile(kubeconfigPath);
      kc.setCurrentContext(currentContext || '');

      const resourceKindHandler = getResourceKindHandler(targetResource.kind);
      const resourcesFromCluster =
        (await resourceKindHandler?.listResourcesInCluster(kc))?.filter(r => r.metadata.name === targetResource.name) ||
        [];

      setNamespaces(resourcesFromCluster.map(r => r.metadata.namespace));
      setMatchingResourcesById(
        resourcesFromCluster?.reduce((matchingResources, r) => {
          delete r.metadata?.managedFields;
          if (!r.apiVersion) {
            r.apiVersion = resourceKindHandler?.clusterApiVersion;
          }
          if (!r.kind) {
            r.kind = resourceKindHandler?.kind;
          }
          matchingResources[r.metadata.uid] = r;
          return matchingResources;
        }, {})
      );

      // set default selected matching resource
      if (targetResource.namespace) {
        const foundResourceFromCluster = resourcesFromCluster.find(
          r => r.metadata.namespace === targetResource.namespace
        );
        if (foundResourceFromCluster) {
          setSelectedMathingResourceId(foundResourceFromCluster.metadata.uid);
          setMatchingResourceText(stringify(foundResourceFromCluster, {sortMapEntries: true}));
        }
      } else if (resourceFilter.namespace) {
        const foundResourceFromCluster = resourcesFromCluster.find(
          r => r.metadata.namespace === resourceFilter.namespace
        );
        if (foundResourceFromCluster) {
          setSelectedMathingResourceId(foundResourceFromCluster.metadata.uid);
          setMatchingResourceText(stringify(foundResourceFromCluster, {sortMapEntries: true}));
        }
      } else {
        setSelectedMathingResourceId(resourcesFromCluster[0].metadata.uid);
        setMatchingResourceText(stringify(resourcesFromCluster[0], {sortMapEntries: true}));
      }

      setHasDiffModalLoaded(true);
    };

    setTargetResourceText(stringify(targetResource.content, {sortMapEntries: true}));

    getClusterResources();
  }, [currentContext, kubeconfigPath, resourceMap, resourceFilter.namespace, targetResource]);

  useEffect(() => {
    if (!isDiffModalVisible) {
      setShouldDiffIgnorePaths(true);
    }
  }, [isDiffModalVisible]);

  return (
    <StyledModal
      title={`Resource Diff on ${targetResource ? targetResource.name : ''}`}
      visible={isDiffModalVisible}
      centered
      width="min-content"
      onCancel={onCloseHandler}
      footer={null}
    >
      <ResizableBox
        width={resizableBoxWidth}
        height={resizableBoxHeight}
        minConstraints={[800, resizableBoxHeight]}
        maxConstraints={[window.innerWidth - 64, resizableBoxHeight]}
        axis="x"
        resizeHandles={['w', 'e']}
        handle={(h: number, ref: LegacyRef<HTMLSpanElement>) => (
          <span className={`custom-modal-handle custom-modal-handle-${h}`} ref={ref} />
        )}
      >
        {!hasDiffModalLoaded ? (
          <div>
            <Skeleton active />
          </div>
        ) : (
          <>
            <MonacoDiffContainer width="100%" height="calc(100% - 140px)" ref={containerRef}>
              <MonacoDiffEditor
                width={containerWidth}
                height={containerHeight}
                language="yaml"
                original={targetResourceText}
                value={cleanMatchingResourceText}
                options={options}
                theme={KUBESHOP_MONACO_THEME}
              />
            </MonacoDiffContainer>

            <TagsContainer>
              <StyledTag>Local</StyledTag>
              <Button
                type="primary"
                ghost
                onClick={handleApply}
                icon={<Icon name="kubernetes" />}
                disabled={!areResourcesDifferent}
              >
                Deploy local resource to cluster <ArrowRightOutlined />
              </Button>
              <Button
                type="primary"
                ghost
                onClick={handleReplace}
                disabled={!shouldDiffIgnorePaths || !areResourcesDifferent}
              >
                <ArrowLeftOutlined /> Replace local resource with cluster resource
              </Button>
              <StyledTag>Cluster</StyledTag>
            </TagsContainer>
            <SwitchContainer onClick={() => setShouldDiffIgnorePaths(!shouldDiffIgnorePaths)}>
              <Switch checked={shouldDiffIgnorePaths} />
              <StyledSwitchLabel>Hide ignored fields</StyledSwitchLabel>
            </SwitchContainer>
            <ButtonContainer>
              <Button onClick={handleRefresh}>Refresh</Button>
              <Button onClick={onCloseHandler} style={{marginLeft: 12}}>
                Close
              </Button>
            </ButtonContainer>

            {isApplyModalVisible && (
              <ModalConfirmWithNamespaceSelect
                isVisible={isApplyModalVisible}
                resources={targetResource ? [targetResource] : []}
                title={confirmModalTitle}
                onOk={selectedNamespace => onClickApplyResource(selectedNamespace)}
                onCancel={() => setIsApplyModalVisible(false)}
              />
            )}
          </>
        )}
      </ResizableBox>
    </StyledModal>
  );
};

export default DiffModal;
