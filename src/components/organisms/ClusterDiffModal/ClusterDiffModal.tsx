import {LegacyRef, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ResizableBox} from 'react-resizable';

import {Button, Modal, Skeleton, message} from 'antd';

import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {makeApplyMultipleResourcesText} from '@constants/makeApplyText';

import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setClusterDiffRefreshDiffResource, setDiffResourceInClusterDiff} from '@redux/reducers/main';
import {closeClusterDiff} from '@redux/reducers/ui';
import {currentConfigSelector, isInPreviewModeSelector} from '@redux/selectors';
import {getClusterResourceText} from '@redux/services/clusterResource';
import {replaceSelectedMatchesWithConfirm} from '@redux/services/replaceSelectedMatchesWithConfirm';
import {applySelectedResourceMatches} from '@redux/thunks/applySelectedResourceMatches';
import {loadClusterDiff} from '@redux/thunks/loadClusterDiff';

import {ClusterDiff, ResourceDiff} from '@molecules';

import Icon from '@components/atoms/Icon';
import ModalConfirmWithNamespaceSelect from '@components/molecules/ModalConfirmWithNamespaceSelect';

import {useWindowSize} from '@utils/hooks';

import Colors, {BackgroundColors} from '@styles/Colors';

const Container = styled.div`
  display: block;
  margin: 0;
  padding: 0;
  height: 75vh;
  overflow: hidden;
`;

const SkeletonContainer = styled.div`
  padding: 10px;
`;

const StyledModal = styled(Modal)<{previewing: boolean}>`
  & .ant-modal-body {
    padding: 8px;
  }
  ${props =>
    props.previewing &&
    `
    & .ant-modal-header {
      background: ${BackgroundColors.previewModeBackground};
    }
    & .ant-modal-title {
      color: ${Colors.blackPure} !important;
    }
    & .ant-modal-close-x {
      color: ${Colors.blackPure} !important;
    }
  `}

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

const StyledButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

type ResourceDiffState = {
  isLoading: boolean;
  localResource?: K8sResource;
  clusterResourceText?: string;
};

function ClusterDiffModal() {
  const dispatch = useAppDispatch();

  const hasClusterDiffLoaded = useAppSelector(state => state.main.clusterDiff.hasLoaded);
  const hasClusterDiffFailed = useAppSelector(state => state.main.clusterDiff.hasFailed);
  const isClusterDiffVisible = useAppSelector(state => state.ui.isClusterDiffVisible);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isApplyingResource = useAppSelector(state => state.main.isApplyingResource);
  const currentConfig = useAppSelector(currentConfigSelector);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const diffResourceId = useAppSelector(state => state.main.clusterDiff.diffResourceId);
  const refreshDiffResource = useAppSelector(state => state.main.clusterDiff.refreshDiffResource);
  const shouldReload = useAppSelector(state => state.main.clusterDiff.shouldReload);

  const matches = useAppSelector(state => state.main.clusterDiff.clusterToLocalResourcesMatches);
  const selectedMatches = useAppSelector(state => state.main.clusterDiff.selectedMatches);
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

  const previewResourceId = useAppSelector(state => state.main.previewResourceId);
  const previewValuesFileId = useAppSelector(state => state.main.previewValuesFileId);

  const [hasAppliedResource, setHasAppliedResource] = useState<boolean>(false);
  const [isApplyModalVisible, setIsApplyModalVisible] = useState<boolean>(false);
  const [resourceDiffState, setResourceDiffState] = useState<ResourceDiffState>({isLoading: false});

  const containerRef = useRef<HTMLDivElement>(null);

  const windowSize = useWindowSize();

  const confirmModalTitle = useMemo(
    () => makeApplyMultipleResourcesText(selectedMatches.length, currentConfig.kubeConfig?.currentContext),
    [selectedMatches, currentConfig.kubeConfig?.currentContext]
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
      const {clusterResourceText} = await getClusterResourceText(
        localResource,
        String(currentConfig.kubeConfig?.path),
        currentConfig.kubeConfig?.currentContext || ''
      );
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
      return `Comparing kustomization preview resources to Cluster resources (${currentConfig.kubeConfig?.currentContext})`;
    }
    if (previewValuesFile) {
      return `Comparing Helm Chart preview resources to Cluster resources (${currentConfig.kubeConfig?.currentContext})`;
    }
    return `Comparing Local Resources to Cluster resources (${currentConfig.kubeConfig?.currentContext})`;
    // eslint-disable-next-line
  }, [
    previewResource,
    previewValuesFile,
    currentConfig.kubeConfig?.currentContext,
    isResourceDiffVisible,
    closeResourceDiff,
  ]);

  const onClickDeploySelected = () => {
    setIsApplyModalVisible(true);
  };

  const onClickApplySelectedResourceMatches = (namespace?: string) => {
    dispatch(applySelectedResourceMatches(namespace));
    setIsApplyModalVisible(false);
  };

  const onClickReplaceSelected = () => {
    if (!currentConfig.kubeConfig?.currentContext) {
      return;
    }
    replaceSelectedMatchesWithConfirm(selectedMatches.length, currentConfig.kubeConfig?.currentContext, dispatch);
  };

  const onCancel = () => {
    if (isResourceDiffVisible) {
      closeResourceDiff();
    } else {
      closeModal();
    }
  };

  return (
    <StyledModal
      title={title}
      visible={isClusterDiffVisible}
      width="min-content"
      onCancel={onCancel}
      footer={
        <StyledButtonsContainer>
          <Button
            type="primary"
            ghost
            style={{float: 'left'}}
            icon={<Icon name="kubernetes" />}
            disabled={
              selectedMatches.length === 0 || !canDeploySelectedMatches || !currentConfig.kubeConfig?.currentContext
            }
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
              disabled={
                selectedMatches.length === 0 || !canReplaceSelectedMatches || !currentConfig.kubeConfig?.currentContext
              }
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
              onOk={selectedNamespace => onClickApplySelectedResourceMatches(selectedNamespace)}
              onCancel={() => setIsApplyModalVisible(false)}
            />
          )}
        </StyledButtonsContainer>
      }
      centered
      previewing={isInPreviewMode}
    >
      <ResizableBox
        width={resizableBoxWidth}
        height={resizableBoxHeight}
        minConstraints={[900, resizableBoxHeight]}
        maxConstraints={[windowSize.width - 64, resizableBoxHeight]}
        axis="x"
        resizeHandles={['w', 'e']}
        handle={(h: number, ref: LegacyRef<HTMLSpanElement>) => (
          <span className={`custom-modal-handle custom-modal-handle-${h}`} ref={ref} />
        )}
      >
        <Container ref={containerRef}>
          {!hasClusterDiffLoaded ? (
            <SkeletonContainer>
              <Skeleton active />
            </SkeletonContainer>
          ) : isResourceDiffVisible ? (
            resourceDiffState.isLoading ? (
              <SkeletonContainer>
                <Skeleton active />
              </SkeletonContainer>
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
        </Container>
      </ResizableBox>
    </StyledModal>
  );
}

export default ClusterDiffModal;
