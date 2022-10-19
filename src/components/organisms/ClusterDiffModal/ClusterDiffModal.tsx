import {LegacyRef, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ResizableBox, ResizeHandle} from 'react-resizable';

import {Button, Skeleton, message} from 'antd';

import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

import {makeApplyMultipleResourcesText} from '@constants/makeApplyText';

import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setClusterDiffRefreshDiffResource, setDiffResourceInClusterDiff} from '@redux/reducers/main';
import {closeClusterDiff} from '@redux/reducers/ui';
import {
  isInPreviewModeSelector,
  kubeConfigContextColorSelector,
  kubeConfigContextSelector,
  kubeConfigPathSelector,
} from '@redux/selectors';
import {getClusterResourceText} from '@redux/services/clusterResource';
import {replaceSelectedMatchesWithConfirm} from '@redux/support/replaceSelectedMatchesWithConfirm';
import {applySelectedResourceMatches} from '@redux/thunks/applySelectedResourceMatches';
import {loadClusterDiff} from '@redux/thunks/loadClusterDiff';

import {ClusterDiff, ModalConfirmWithNamespaceSelect, ResourceDiff} from '@molecules';

import {Icon} from '@atoms';

import {useWindowSize} from '@utils/hooks';

import * as S from './ClusterDiffModal.styled';

type ResourceDiffState = {
  isLoading: boolean;
  localResource?: K8sResource;
  clusterResourceText?: string;
};

const ClusterDiffModal = () => {
  const dispatch = useAppDispatch();
  const diffResourceId = useAppSelector(state => state.main.clusterDiff.diffResourceId);
  const hasClusterDiffFailed = useAppSelector(state => state.main.clusterDiff.hasFailed);
  const hasClusterDiffLoaded = useAppSelector(state => state.main.clusterDiff.hasLoaded);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const isApplyingResource = useAppSelector(state => state.main.isApplyingResource);
  const isClusterDiffVisible = useAppSelector(state => state.ui.isClusterDiffVisible);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const matches = useAppSelector(state => state.main.clusterDiff.clusterToLocalResourcesMatches);
  const previewResourceId = useAppSelector(state => state.main.previewResourceId);
  const previewValuesFileId = useAppSelector(state => state.main.previewValuesFileId);
  const refreshDiffResource = useAppSelector(state => state.main.clusterDiff.refreshDiffResource);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedMatches = useAppSelector(state => state.main.clusterDiff.selectedMatches);
  const shouldReload = useAppSelector(state => state.main.clusterDiff.shouldReload);
  const [canDeploySelectedMatches, canReplaceSelectedMatches] = useAppSelector(state => {
    let canDeployMatchesCount = 0;
    let canReplaceMatchesCount = 0;
    selectedMatches.forEach(matchId => {
      const currentMatch = state.main.clusterDiff.clusterToLocalResourcesMatches.find(m => m.id === matchId);
      if (currentMatch?.localResourceIds?.length) {
        canDeployMatchesCount += 1;
      }
      if (currentMatch?.clusterResourceId && currentMatch?.localResourceIds?.length) {
        canReplaceMatchesCount += 1;
      }
    });
    return [selectedMatches.length === canDeployMatchesCount, selectedMatches.length === canReplaceMatchesCount];
  });

  const [hasAppliedResource, setHasAppliedResource] = useState<boolean>(false);
  const [isApplyModalVisible, setIsApplyModalVisible] = useState<boolean>(false);
  const [resourceDiffState, setResourceDiffState] = useState<ResourceDiffState>({isLoading: false});

  const containerRef = useRef<HTMLDivElement>(null);

  const windowSize = useWindowSize();

  const confirmModalTitle = useMemo(
    () => makeApplyMultipleResourcesText(selectedMatches.length, kubeConfigContext, kubeConfigContextColor),
    [selectedMatches, kubeConfigContext, kubeConfigContextColor]
  );

  const selectedResources = useMemo(
    () =>
      matches
        .filter(match => selectedMatches.includes(match.id))
        .map(match =>
          match.localResourceIds && match.localResourceIds.length > 0
            ? resourceMap[match.localResourceIds[0]]
            : undefined
        )
        .filter((r): r is K8sResource => r !== undefined),
    [matches, selectedMatches, resourceMap]
  );

  const resizableBoxHeight = useMemo(() => windowSize.height * (75 / 100), [windowSize.height]);
  const resizableBoxWidth = useMemo(() => {
    const vwValue = windowSize.width < 1200 ? 95 : 80;
    return windowSize.width * (vwValue / 100);
  }, [windowSize.width]);

  const isResourceDiffVisible = useMemo(() => {
    return Boolean(diffResourceId);
  }, [diffResourceId]);

  const loadClusterResourceText = async (localResource: K8sResource) => {
    try {
      const {clusterResourceText} = await getClusterResourceText(localResource, kubeConfigPath, kubeConfigContext);
      setResourceDiffState({
        isLoading: false,
        localResource,
        clusterResourceText,
      });
    } catch (err: any) {
      message.error(err.message);
      setResourceDiffState({
        isLoading: false,
        localResource: undefined,
        clusterResourceText: undefined,
      });
    }
  };

  const closeResourceDiff = useCallback(() => {
    if (hasAppliedResource) {
      dispatch(loadClusterDiff());
      setHasAppliedResource(false);
    }
    dispatch(setDiffResourceInClusterDiff(undefined));
  }, [hasAppliedResource, dispatch]);

  const resourceDiffLocalResource = useMemo(() => {
    if (!diffResourceId) {
      return undefined;
    }
    return resourceMap[diffResourceId];
  }, [resourceMap, diffResourceId]);

  useEffect(() => {
    if (resourceDiffLocalResource) {
      setResourceDiffState({
        isLoading: true,
        localResource: resourceDiffLocalResource,
        clusterResourceText: undefined,
      });
      loadClusterResourceText(resourceDiffLocalResource);
    }
    // eslint-disable-next-line
  }, [resourceDiffLocalResource]);

  useEffect(() => {
    if (refreshDiffResource && resourceDiffLocalResource) {
      setResourceDiffState({
        isLoading: true,
        localResource: resourceDiffLocalResource,
        clusterResourceText: undefined,
      });
      loadClusterResourceText(resourceDiffLocalResource);
      dispatch(setClusterDiffRefreshDiffResource(false));
    }
    // eslint-disable-next-line
  }, [refreshDiffResource]);

  const previewResource = useMemo(() => {
    if (!previewResourceId) {
      return null;
    }
    return resourceMap[previewResourceId];
  }, [resourceMap, previewResourceId]);

  const previewValuesFile = useMemo(() => {
    if (!previewValuesFileId) {
      return null;
    }
    return helmValuesMap[previewValuesFileId];
  }, [helmValuesMap, previewValuesFileId]);

  // TODO: improve this by updating the clusterToLocalResourcesMatches after apply instead of reloading the entire cluster diff
  useEffect(() => {
    if (!isApplyingResource && isClusterDiffVisible && !refreshDiffResource) {
      dispatch(loadClusterDiff());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApplyingResource, refreshDiffResource]);

  const closeModal = useCallback(() => {
    dispatch(closeClusterDiff());
  }, [dispatch]);

  useEffect(() => {
    if (isClusterDiffVisible && (!hasClusterDiffLoaded || shouldReload)) {
      dispatch(loadClusterDiff());
    }
  }, [isClusterDiffVisible, hasClusterDiffLoaded, shouldReload, dispatch]);

  useEffect(() => {
    if (hasClusterDiffFailed) {
      closeModal();
    }
  }, [hasClusterDiffFailed, closeModal]);

  const title = useMemo(() => {
    if (isResourceDiffVisible) {
      return (
        <>
          <span onClick={closeResourceDiff} style={{cursor: 'pointer'}}>
            <ArrowLeftOutlined style={{marginRight: 8}} />
            Back to Cluster Compare
          </span>
        </>
      );
    }
    if (previewResource) {
      return `Comparing kustomization preview resources to Cluster resources (${kubeConfigContext})`;
    }
    if (previewValuesFile) {
      return `Comparing Helm Chart preview resources to Cluster resources (${kubeConfigContext})`;
    }
    return `Comparing Local Resources to Cluster resources (${kubeConfigContext})`;
    // eslint-disable-next-line
  }, [previewResource, previewValuesFile, kubeConfigContext, isResourceDiffVisible, closeResourceDiff]);

  const onClickDeploySelected = () => {
    setIsApplyModalVisible(true);
  };

  const onClickApplySelectedResourceMatches = (namespace?: {name: string; new: boolean}) => {
    dispatch(applySelectedResourceMatches(namespace));
    setIsApplyModalVisible(false);
  };

  const onClickReplaceSelected = () => {
    if (!kubeConfigContext) {
      return;
    }
    replaceSelectedMatchesWithConfirm(selectedMatches.length, kubeConfigContext, dispatch);
  };

  const onCancel = () => {
    if (isResourceDiffVisible) {
      closeResourceDiff();
    } else {
      closeModal();
    }
  };

  return (
    <S.Modal
      $previewing={isInPreviewMode}
      title={title}
      open={isClusterDiffVisible}
      width="min-content"
      onCancel={onCancel}
      footer={
        <S.ButtonsContainer>
          <Button
            type="primary"
            ghost
            style={{float: 'left'}}
            icon={<Icon name="kubernetes" />}
            disabled={selectedMatches.length === 0 || !canDeploySelectedMatches || !kubeConfigContext}
            onClick={onClickDeploySelected}
          >
            Deploy selected local resources ({selectedMatches.length}) to cluster
            <ArrowRightOutlined />
          </Button>

          <div>
            <Button
              type="primary"
              ghost
              style={{float: 'left'}}
              disabled={selectedMatches.length === 0 || !canReplaceSelectedMatches || !kubeConfigContext}
              onClick={onClickReplaceSelected}
            >
              <ArrowLeftOutlined />
              Replace selected local resources ({selectedMatches.length}) with cluster resources
            </Button>
            <Button onClick={closeModal}>Close</Button>
          </div>

          {isApplyModalVisible && (
            <ModalConfirmWithNamespaceSelect
              isVisible={isApplyModalVisible}
              resources={selectedResources}
              title={confirmModalTitle}
              onOk={namespace => onClickApplySelectedResourceMatches(namespace)}
              onCancel={() => setIsApplyModalVisible(false)}
            />
          )}
        </S.ButtonsContainer>
      }
      centered
    >
      <ResizableBox
        width={resizableBoxWidth}
        height={resizableBoxHeight}
        minConstraints={[900, resizableBoxHeight]}
        maxConstraints={[windowSize.width - 64, resizableBoxHeight]}
        axis="x"
        resizeHandles={['w', 'e']}
        handle={(h: ResizeHandle, ref: LegacyRef<HTMLSpanElement>) => (
          <span className={`custom-modal-handle custom-modal-handle-${h}`} ref={ref} />
        )}
      >
        <S.Container ref={containerRef}>
          {!hasClusterDiffLoaded ? (
            <S.SkeletonContainer>
              <Skeleton active />
            </S.SkeletonContainer>
          ) : isResourceDiffVisible ? (
            resourceDiffState.isLoading ? (
              <S.SkeletonContainer>
                <Skeleton active />
              </S.SkeletonContainer>
            ) : (
              resourceDiffState.localResource &&
              resourceDiffState.clusterResourceText && (
                <>
                  <div style={{display: 'flex', justifyContent: 'center', margin: '8px 0'}}>
                    <span style={{fontWeight: 600}}>Resource Diff on {resourceDiffState.localResource?.name}</span>
                  </div>
                  <ResourceDiff
                    localResource={resourceDiffState.localResource}
                    clusterResourceText={resourceDiffState.clusterResourceText}
                    isInClusterDiff
                    onApply={() => setHasAppliedResource(true)}
                  />
                </>
              )
            )
          ) : (
            <ClusterDiff />
          )}
        </S.Container>
      </ResizableBox>
    </S.Modal>
  );
};

export default ClusterDiffModal;
