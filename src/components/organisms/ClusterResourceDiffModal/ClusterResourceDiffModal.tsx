import {LegacyRef, useEffect, useMemo, useState} from 'react';
import {MonacoDiffEditor} from 'react-monaco-editor';
import {useStore} from 'react-redux';
import {ResizableBox, ResizeHandle} from 'react-resizable';
import {useMeasure, useWindowSize} from 'react-use';

import {Button, Select, Skeleton, Switch} from 'antd';

import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

import {stringify} from 'yaml';

import {ClusterName, makeApplyKustomizationText, makeApplyResourceText} from '@constants/makeApplyText';

import {isInClusterModeSelector, kubeConfigContextColorSelector, kubeConfigContextSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {closeResourceDiffModal} from '@redux/reducers/main';
import {useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';
import {isKustomizationResource} from '@redux/services/kustomize';
import {joinK8sResource} from '@redux/services/resource';
import {applyResourceToCluster} from '@redux/thunks/applyResource';
import {updateResource} from '@redux/thunks/updateResource';

import {ModalConfirmWithNamespaceSelect} from '@molecules';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';
import {removeIgnoredPathsFromResourceObject} from '@utils/resources';

import {AlertEnum, AlertType} from '@shared/models/alert';
import {K8sResource} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';

import * as S from './ClusterResourceDiffModal.styled';

const monacoEditorOptions = {
  readOnly: true,
  renderSideBySide: true,
  minimap: {
    enabled: false,
  },
};

const ClusterResourceDiffModal = () => {
  const dispatch = useAppDispatch();
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const localResourceMetaMap = useResourceMetaMap('local');
  const clusterResourceMetaMap = useResourceMetaMap('cluster');
  const targetResourceId = useAppSelector(state => state.main.resourceDiff.targetResourceId);

  const store = useStore<RootState>();

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

  const targetResource: K8sResource | undefined = useMemo(() => {
    if (!targetResourceId || !clusterResourceMetaMap) {
      return undefined;
    }

    return joinK8sResource(
      clusterResourceMetaMap[targetResourceId],
      store.getState().main.resourceContentMapByStorage.cluster[targetResourceId]
    );
  }, [clusterResourceMetaMap, targetResourceId, store]);

  const resizableBoxHeight = useMemo(() => windowSize.height * (75 / 100), [windowSize.height]);
  const resizableBoxWidth = useMemo(() => {
    const vwValue = windowSize.width < 1200 ? 95 : 80;
    return windowSize.width * (vwValue / 100);
  }, [windowSize.width]);

  const cleanTargetResourceText = useMemo(() => {
    if (!isDiffModalVisible || !targetResource || !targetResource.object) {
      return undefined;
    }

    if (!shouldDiffIgnorePaths) {
      return stringify(targetResource.object, {sortMapEntries: true});
    }

    return stringify(removeIgnoredPathsFromResourceObject(targetResource.object, targetResource.namespace), {
      sortMapEntries: true,
    });
  }, [isDiffModalVisible, shouldDiffIgnorePaths, targetResource]);

  const areResourcesDifferent = useMemo(() => {
    return cleanTargetResourceText !== matchingResourceText;
  }, [cleanTargetResourceText, matchingResourceText]);

  const confirmModalTitle = useMemo(() => {
    if (!selectedMatchingResourceId || !localResourceMetaMap[selectedMatchingResourceId]) {
      return '';
    }

    const resource = localResourceMetaMap[selectedMatchingResourceId];

    return isKustomizationResource(resource)
      ? makeApplyKustomizationText(resource.name, kubeConfigContext, kubeConfigContextColor)
      : makeApplyResourceText(resource.name, kubeConfigContext, kubeConfigContextColor);
  }, [selectedMatchingResourceId, localResourceMetaMap, kubeConfigContext, kubeConfigContextColor]);

  const matchingLocalResources: Record<string, K8sResource<'local'>> | undefined = useMemo(() => {
    if (!isDiffModalVisible || !targetResource) {
      return;
    }

    return Object.fromEntries(
      Object.entries(localResourceMetaMap)
        .filter(entry => {
          const value = entry[1];
          return (
            value.name === targetResource.name &&
            value.kind === targetResource.kind &&
            value.apiVersion === targetResource.apiVersion
          );
        })
        .map(entry => [
          entry[0],
          joinK8sResource(entry[1], store.getState().main.resourceContentMapByStorage.local[entry[0]]),
        ])
    );
  }, [isDiffModalVisible, localResourceMetaMap, targetResource, store]);

  const onCloseHandler = () => {
    if (isApplyModalVisible) {
      setIsApplyModalVisible(false);
    }

    setHasDiffModalLoaded(false);
    dispatch(closeResourceDiffModal());
  };

  const onClickApplyResource = (namespace?: {name: string; new: boolean}) => {
    if (selectedMatchingResourceId) {
      const resource = localResourceMetaMap[selectedMatchingResourceId];
      if (resource) {
        dispatch(
          applyResourceToCluster({
            resourceIdentifier: {id: selectedMatchingResourceId, storage: 'local'},
            namespace,
            options: {isInClusterMode},
          })
        );
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
    setMatchingResourceText(stringify(matchingLocalResources[resourceId].object, {sortMapEntries: true}));
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
        resourceIdentifier: {id: selectedMatchingResourceId, storage: 'local'},
        text: cleanTargetResourceText,
        preventSelectionAndHighlightsUpdate: true,
      })
    );
  };

  useEffect(() => {
    if (
      !isDiffModalVisible ||
      !targetResource ||
      !targetResource.object ||
      !localResourceMetaMap ||
      !clusterResourceMetaMap ||
      !matchingLocalResources
    ) {
      return;
    }

    // matching resource was not found
    if (!Object.values(matchingLocalResources).length) {
      const alert: AlertType = {
        type: AlertEnum.Error,
        title: 'Diff failed',
        message: `Failed to retrieve ${targetResource.object.kind} ${targetResource.object.metadata.name} from local`,
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
        setMatchingResourceText(stringify(foundResource.object, {sortMapEntries: true}));
      }
    } else if (targetResource.namespace === 'default') {
      const foundResource = Object.values(matchingLocalResources).filter(
        r => r.namespace && r.namespace === targetResource.namespace
      )[0];

      if (foundResource) {
        hasLocalMatchingResource = true;
        setSelectedMatchingResourceId(foundResource.id);
        setMatchingResourceText(stringify(foundResource.object, {sortMapEntries: true}));
      } else {
        const foundResourceWithoutNamespace = Object.values(matchingLocalResources).filter(r => !r.namespace)[0];

        if (foundResourceWithoutNamespace) {
          hasLocalMatchingResource = true;
          setSelectedMatchingResourceId(foundResourceWithoutNamespace.id);
          setMatchingResourceText(stringify(foundResourceWithoutNamespace.object, {sortMapEntries: true}));
        }
      }
    }

    if (!hasLocalMatchingResource) {
      setSelectedMatchingResourceId(Object.keys(matchingLocalResources)[0]);
      setMatchingResourceText(stringify(Object.values(matchingLocalResources)[0].object, {sortMapEntries: true}));
    }

    setHasDiffModalLoaded(true);
  }, [
    dispatch,
    isDiffModalVisible,
    matchingLocalResources,
    localResourceMetaMap,
    clusterResourceMetaMap,
    targetResource,
  ]);

  return (
    <>
      <S.Modal
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
                      {value.origin.filePath}
                    </Select.Option>
                  ))}
              </Select>
              <S.SwitchContainer onClick={() => setShouldDiffIgnorePaths(!shouldDiffIgnorePaths)}>
                <Switch checked={shouldDiffIgnorePaths} />
                <S.SwitchLabel>Hide ignored fields</S.SwitchLabel>
              </S.SwitchContainer>
            </S.FileSelectContainer>
          </S.TitleContainer>
        }
        open={isDiffModalVisible}
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
          handle={(h: ResizeHandle, ref: LegacyRef<HTMLSpanElement>) => (
            <span className={`custom-modal-handle custom-modal-handle-${h}`} ref={ref} />
          )}
        >
          {!hasDiffModalLoaded ? (
            <div>
              <Skeleton active />
            </div>
          ) : (
            <>
              <S.TagsContainer>
                <S.Tag>
                  Cluster{' '}
                  <ClusterName $kubeConfigContextColor={kubeConfigContextColor}>{kubeConfigContext}</ClusterName>
                </S.Tag>
                <S.Tag>Local</S.Tag>
              </S.TagsContainer>
              <S.MonacoDiffContainer width="100%" height="calc(100% - 80px)" ref={containerRef}>
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

              <S.ActionButtonsContainer>
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
              </S.ActionButtonsContainer>
            </>
          )}
        </ResizableBox>
      </S.Modal>

      {targetResourceId && isApplyModalVisible && (
        <ModalConfirmWithNamespaceSelect
          isVisible={isApplyModalVisible}
          resourceMetaList={selectedMatchingResourceId ? [localResourceMetaMap[selectedMatchingResourceId]] : []}
          title={confirmModalTitle}
          onOk={namespace => onClickApplyResource(namespace)}
          onCancel={() => setIsApplyModalVisible(false)}
        />
      )}
    </>
  );
};

export default ClusterResourceDiffModal;
