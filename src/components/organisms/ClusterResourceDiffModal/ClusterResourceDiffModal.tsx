import {LegacyRef, useEffect, useMemo, useState} from 'react';
import {MonacoDiffEditor} from 'react-monaco-editor';
import {ResizableBox} from 'react-resizable';
import {useMeasure, useWindowSize} from 'react-use';

import {Button, Select, Skeleton, Switch} from 'antd';

import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

import {stringify} from 'yaml';

import {CLUSTER_DIFF_PREFIX, PREVIEW_PREFIX} from '@constants/constants';
import {makeApplyKustomizationText, makeApplyResourceText} from '@constants/makeApplyText';

import {AlertEnum, AlertType} from '@models/alert';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {closeResourceDiffModal} from '@redux/reducers/main';
import {currentConfigSelector, isInClusterModeSelector, kubeConfigContextSelector} from '@redux/selectors';
import {isKustomizationResource} from '@redux/services/kustomize';
import {applyResource} from '@redux/thunks/applyResource';
import {updateResource} from '@redux/thunks/updateResource';

import ModalConfirmWithNamespaceSelect from '@components/molecules/ModalConfirmWithNamespaceSelect';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';
import {removeIgnoredPathsFromResourceContent} from '@utils/resources';

import * as S from './styled';

const monacoEditorOptions = {
  readOnly: true,
  renderSideBySide: true,
  minimap: {
    enabled: false,
  },
};

const ClusterResourceDiffModal = () => {
  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const projectConfig = useAppSelector(currentConfigSelector);
  const previewType = useAppSelector(state => state.main.previewType);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const targetResourceId = useAppSelector(state => state.main.resourceDiff.targetResourceId);

  const isInClusterMode = useAppSelector(isInClusterModeSelector);

  const [containerRef, {height: containerHeight, width: containerWidth}] = useMeasure<HTMLDivElement>();

  const [hasDiffModalLoaded, setHasDiffModalLoaded] = useState(false);
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [matchingResourceText, setMatchingResourceText] = useState<string>();
  const [selectedMatchingResourceId, setSelectedMatchingResourceId] = useState<string>();
  const [shouldDiffIgnorePaths, setShouldDiffIgnorePaths] = useState<boolean>(true);

  const windowSize = useWindowSize();

  const isDiffModalVisible = useMemo(
    () => Boolean(targetResourceId) && isInClusterMode,
    [isInClusterMode, targetResourceId]
  );

  const targetResource = useMemo(() => {
    if (!targetResourceId || !resourceMap) {
      return undefined;
    }

    return resourceMap[targetResourceId];
  }, [resourceMap, targetResourceId]);

  const resizableBoxHeight = useMemo(() => windowSize.height * (75 / 100), [windowSize.height]);
  const resizableBoxWidth = useMemo(() => {
    const vwValue = windowSize.width < 1200 ? 95 : 80;
    return windowSize.width * (vwValue / 100);
  }, [windowSize.width]);

  const cleanTargetResourceText = useMemo(() => {
    if (!isDiffModalVisible || !targetResource || !targetResource.content) {
      return undefined;
    }

    if (!shouldDiffIgnorePaths) {
      return stringify(targetResource.content, {sortMapEntries: true});
    }

    return stringify(removeIgnoredPathsFromResourceContent(targetResource.content, targetResource.namespace), {
      sortMapEntries: true,
    });
  }, [isDiffModalVisible, shouldDiffIgnorePaths, targetResource]);

  const areResourcesDifferent = useMemo(() => {
    return cleanTargetResourceText !== matchingResourceText;
  }, [cleanTargetResourceText, matchingResourceText]);

  const confirmModalTitle = useMemo(() => {
    if (!selectedMatchingResourceId || !resourceMap[selectedMatchingResourceId]) {
      return '';
    }

    const resource = resourceMap[selectedMatchingResourceId];

    return isKustomizationResource(resource)
      ? makeApplyKustomizationText(resource.name, kubeConfigContext)
      : makeApplyResourceText(resource.name, kubeConfigContext);
  }, [kubeConfigContext, selectedMatchingResourceId, resourceMap]);

  const matchingLocalResources = useMemo(() => {
    if (!isDiffModalVisible || !targetResource) {
      return;
    }

    return Object.fromEntries(
      Object.entries(resourceMap).filter(entry => {
        const value = entry[1];
        return (
          !value.filePath.startsWith(PREVIEW_PREFIX) &&
          !value.filePath.startsWith(CLUSTER_DIFF_PREFIX) &&
          value.name === targetResource.name
        );
      })
    );
  }, [isDiffModalVisible, resourceMap, targetResource]);

  const onCloseHandler = () => {
    if (isApplyModalVisible) {
      setIsApplyModalVisible(false);
    }

    setHasDiffModalLoaded(false);
    dispatch(closeResourceDiffModal());
  };

  const onClickApplyResource = (namespace?: {name: string; new: boolean}) => {
    if (selectedMatchingResourceId) {
      const resource = resourceMap[selectedMatchingResourceId];
      if (resource) {
        applyResource(resource.id, resourceMap, fileMap, dispatch, projectConfig, kubeConfigContext, namespace, {
          isClusterPreview: previewType === 'cluster',
        });
        onCloseHandler();
      }
    }
    setIsApplyModalVisible(false);
  };

  const onFileSelectHandler = (resourceId: string) => {
    if (!matchingLocalResources) {
      return;
    }

    setSelectedMatchingResourceId(resourceId);
    setMatchingResourceText(stringify(matchingLocalResources[resourceId].content, {sortMapEntries: true}));
  };

  const handleApply = () => {
    if (!targetResource || !targetResource.id) {
      return;
    }

    setIsApplyModalVisible(true);
  };

  const handleReplace = () => {
    if (!shouldDiffIgnorePaths || !cleanTargetResourceText || !selectedMatchingResourceId) {
      return;
    }

    dispatch(
      updateResource({
        resourceId: selectedMatchingResourceId,
        text: cleanTargetResourceText,
        preventSelectionAndHighlightsUpdate: true,
        isInClusterMode: true,
      })
    );
  };

  useEffect(() => {
    if (!isDiffModalVisible || !targetResource || !targetResource.content || !resourceMap || !matchingLocalResources) {
      return;
    }

    // matching resource was not found
    if (!Object.values(matchingLocalResources).length) {
      const alert: AlertType = {
        type: AlertEnum.Error,
        title: 'Diff failed',
        message: `Failed to retrieve ${targetResource.content.kind} ${targetResource.content.metadata.name} from local`,
      };

      dispatch(setAlert(alert));
      dispatch(closeResourceDiffModal());
      setHasDiffModalLoaded(false);
      return;
    }

    // set default selected matching resource
    let hasLocalMatchingResource = false;

    if (targetResource.namespace !== 'default') {
      const foundResource = Object.values(matchingLocalResources).filter(
        r => r.namespace && r.namespace === targetResource.namespace
      )[0];

      if (foundResource) {
        hasLocalMatchingResource = true;
        setSelectedMatchingResourceId(foundResource.id);
        setMatchingResourceText(stringify(foundResource.content, {sortMapEntries: true}));
      }
    } else if (targetResource.namespace === 'default') {
      const foundResource = Object.values(matchingLocalResources).filter(
        r => r.namespace && r.namespace === targetResource.namespace
      )[0];

      if (foundResource) {
        hasLocalMatchingResource = true;
        setSelectedMatchingResourceId(foundResource.id);
        setMatchingResourceText(stringify(foundResource.content, {sortMapEntries: true}));
      } else {
        const foundResourceWithoutNamespace = Object.values(matchingLocalResources).filter(r => !r.namespace)[0];

        if (foundResourceWithoutNamespace) {
          hasLocalMatchingResource = true;
          setSelectedMatchingResourceId(foundResourceWithoutNamespace.id);
          setMatchingResourceText(stringify(foundResourceWithoutNamespace.content, {sortMapEntries: true}));
        }
      }
    }

    if (!hasLocalMatchingResource) {
      setSelectedMatchingResourceId(Object.keys(matchingLocalResources)[0]);
      setMatchingResourceText(stringify(Object.values(matchingLocalResources)[0].content, {sortMapEntries: true}));
    }

    setHasDiffModalLoaded(true);
  }, [dispatch, isDiffModalVisible, matchingLocalResources, resourceMap, targetResource]);

  return (
    <>
      <S.StyledModal
        centered
        footer={null}
        title={
          <S.TitleContainer>
            Resource Diff on ${targetResource ? targetResource.name : ''}
            <S.FileSelectContainer>
              File:
              <Select
                value={selectedMatchingResourceId}
                onChange={(id: string) => onFileSelectHandler(id)}
                style={{width: '300px', marginLeft: '16px'}}
              >
                {matchingLocalResources &&
                  Object.entries(matchingLocalResources).map(([key, value]) => (
                    <Select.Option key={key} value={key}>
                      {value.filePath}
                    </Select.Option>
                  ))}
              </Select>
            </S.FileSelectContainer>
          </S.TitleContainer>
        }
        visible={isDiffModalVisible}
        width="min-width"
        onCancel={onCloseHandler}
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
              <S.MonacoDiffContainer width="100%" height="calc(100% - 140px)" ref={containerRef}>
                <MonacoDiffEditor
                  width={containerWidth}
                  height={containerHeight}
                  language="yaml"
                  original={cleanTargetResourceText}
                  value={matchingResourceText}
                  options={monacoEditorOptions}
                  theme={KUBESHOP_MONACO_THEME}
                />
              </S.MonacoDiffContainer>

              <S.TagsContainer>
                <S.StyledTag>Cluster</S.StyledTag>
                <Button disabled={!areResourcesDifferent} ghost type="primary" onClick={handleReplace}>
                  Replace local resource with cluster resource <ArrowRightOutlined />
                </Button>
                <Button
                  disabled={!shouldDiffIgnorePaths || !areResourcesDifferent}
                  ghost
                  type="primary"
                  onClick={handleApply}
                >
                  <ArrowLeftOutlined /> Deploy local resource to cluster
                </Button>
                <S.StyledTag>Local</S.StyledTag>
              </S.TagsContainer>

              <S.SwitchContainer>
                <div onClick={() => setShouldDiffIgnorePaths(!shouldDiffIgnorePaths)}>
                  <Switch checked={shouldDiffIgnorePaths} />
                  <S.StyledSwitchLabel>Hide ignored fields</S.StyledSwitchLabel>
                </div>
              </S.SwitchContainer>
            </>
          )}
        </ResizableBox>
      </S.StyledModal>

      {targetResourceId && isApplyModalVisible && (
        <ModalConfirmWithNamespaceSelect
          isVisible={isApplyModalVisible}
          resources={selectedMatchingResourceId ? [resourceMap[selectedMatchingResourceId]] : []}
          title={confirmModalTitle}
          onOk={namespace => onClickApplyResource(namespace)}
          onCancel={() => setIsApplyModalVisible(false)}
        />
      )}
    </>
  );
};

export default ClusterResourceDiffModal;
