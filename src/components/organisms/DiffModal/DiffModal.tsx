import {LegacyRef, useEffect, useMemo, useState} from 'react';
import {MonacoDiffEditor} from 'react-monaco-editor';
import {ResizableBox} from 'react-resizable';
import {useMeasure} from 'react-use';

import {Button, Modal, Switch, Tag} from 'antd';

import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

import styled from 'styled-components';
import {parse, stringify} from 'yaml';

import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResource} from '@redux/reducers/main';
import {isKustomizationResource} from '@redux/services/kustomize';
import {applyResource} from '@redux/thunks/applyResource';
import {performResourceDiff} from '@redux/thunks/diffResource';

import Icon from '@components/atoms/Icon';
import ModalConfirmWithNamespaceSelect from '@components/molecules/ModalConfirmWithNamespaceSelect';

import {useWindowSize} from '@utils/hooks';
import {KUBESHOP_MONACO_THEME} from '@utils/monaco';
import {removeIgnoredPathsFromResourceContent} from '@utils/resources';

import Colors from '@styles/Colors';

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

  // this is the content of the cluster resource
  const diffContent = useAppSelector(state => state.main.diffContent);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const diffResourceId = useAppSelector(state => state.main.diffResourceId);
  const previewType = useAppSelector(state => state.main.previewType);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const kubeconfig = useAppSelector(state => state.config.kubeconfigPath);
  const kubeconfigContext = useAppSelector(state => state.config.kubeConfig.currentContext);

  const [containerRef, {height: containerHeight, width: containerWidth}] = useMeasure<HTMLDivElement>();

  // this is the local resource
  const [diffResource, setDiffResource] = useState<K8sResource>();
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [isVisible, setVisible] = useState(false);
  const [resourceContent, setResourceContent] = useState<string>();
  const [shouldDiffIgnorePaths, setShouldDiffIgnorePaths] = useState<boolean>(true);

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
    const resource = resourceMap[diffResourceId || ''];
    return isKustomizationResource(resource)
      ? `Deploy ${resource?.name} kustomization to cluster [${kubeconfigContext || ''}]?`
      : `Deploy ${resource?.name} to cluster [${kubeconfigContext || ''}]?`;
  }, [diffResourceId, kubeconfigContext]);

  useEffect(() => {
    if (!diffResourceId) {
      return;
    }
    setDiffResource(resourceMap[diffResourceId]);
  }, [diffResourceId, resourceMap]);

  useEffect(() => {
    if (resourceMap && diffResource) {
      setResourceContent(stringify(diffResource.content, {sortMapEntries: true}));
    }

    setVisible(Boolean(performResourceDiff) && Boolean(resourceMap) && Boolean(diffContent));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diffContent, diffResource]);

  useEffect(() => {
    if (!isVisible) {
      setShouldDiffIgnorePaths(true);
    }
  }, [isVisible]);

  const cleanDiffContent = useMemo(() => {
    if (!diffContent) return undefined;
    if (!diffResource?.content) return undefined;
    if (!shouldDiffIgnorePaths) {
      return diffContent;
    }
    const diffContentObject = parse(diffContent);
    const newDiffContentObject = removeIgnoredPathsFromResourceContent(diffContentObject);
    const cleanDiffContentString = stringify(newDiffContentObject, {sortMapEntries: true});
    return cleanDiffContentString;
  }, [diffContent, diffResource?.content, shouldDiffIgnorePaths]);

  const areResourcesDifferent = useMemo(() => {
    return resourceContent !== cleanDiffContent;
  }, [resourceContent, cleanDiffContent]);

  const handleApply = () => {
    if (diffResourceId) {
      setIsApplyModalVisible(true);
    }
  };

  const handleReplace = () => {
    if (!diffResource || !shouldDiffIgnorePaths || !cleanDiffContent) {
      return;
    }
    dispatch(
      updateResource({
        resourceId: diffResource.id,
        content: cleanDiffContent,
        preventSelectionAndHighlightsUpdate: true,
      })
    );
  };

  const handleRefresh = () => {
    if (diffResourceId) {
      dispatch(performResourceDiff(diffResourceId));
    }
  };

  const handleOk = () => {
    dispatch(performResourceDiff(''));
  };

  const onClickApplyResource = (namespace: string) => {
    if (diffResourceId) {
      const resource = resourceMap[diffResourceId];
      if (resource) {
        applyResource(resource.id, resourceMap, fileMap, dispatch, kubeconfig, kubeconfigContext || '', {
          isClusterPreview: previewType === 'cluster',
          shouldPerformDiff: true,
        });
      }
    }
    setIsApplyModalVisible(false);
  };

  return (
    <StyledModal
      title={`Resource Diff on ${diffResource ? diffResource.name : ''}`}
      visible={isVisible}
      centered
      width="min-content"
      onCancel={handleOk}
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
        <>
          <MonacoDiffContainer width="100%" height="calc(100% - 140px)" ref={containerRef}>
            <MonacoDiffEditor
              width={containerWidth}
              height={containerHeight}
              language="yaml"
              original={resourceContent}
              value={cleanDiffContent}
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
            <Button onClick={handleOk} style={{marginLeft: 12}}>
              Close
            </Button>
          </ButtonContainer>

          {isApplyModalVisible && (
            <ModalConfirmWithNamespaceSelect
              isModalVisible={isApplyModalVisible}
              resources={diffResourceId && resourceMap[diffResourceId] ? [resourceMap[diffResourceId]] : []}
              title={confirmModalTitle}
              onOk={selectedNamespace => onClickApplyResource(selectedNamespace)}
              onCancel={() => setIsApplyModalVisible(false)}
            />
          )}
        </>
      </ResizableBox>
    </StyledModal>
  );
};

export default DiffModal;
