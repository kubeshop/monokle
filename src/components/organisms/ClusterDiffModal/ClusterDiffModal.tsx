import {LegacyRef, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ResizableBox} from 'react-resizable';

import {Button, Modal, Skeleton, message} from 'antd';

import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setClusterDiffRefreshDiffResource, setDiffResourceInClusterDiff} from '@redux/reducers/main';
import {closeClusterDiff} from '@redux/reducers/ui';
import {isInPreviewModeSelector} from '@redux/selectors';
import {applySelectedMatchesWithConfirm} from '@redux/services/applySelectedMatchesWithConfirm';
import {getClusterResourceText} from '@redux/services/clusterResource';
import {replaceSelectedMatchesWithConfirm} from '@redux/services/replaceSelectedMatchesWithConfirm';
import {loadClusterDiff} from '@redux/thunks/loadClusterDiff';

import {ClusterDiff, ResourceDiff} from '@molecules';

import Icon from '@components/atoms/Icon';

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
  const kubeconfigPath = useAppSelector(state => state.config.kubeconfigPath);
  const currentContext = useAppSelector(state => state.config.kubeConfig.currentContext);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const diffResourceId = useAppSelector(state => state.main.clusterDiff.diffResourceId);
  const refreshDiffResource = useAppSelector(state => state.main.clusterDiff.refreshDiffResource);
  const shouldReload = useAppSelector(state => state.main.clusterDiff.shouldReload);

  const selectedMatches = useAppSelector(state => state.main.clusterDiff.selectedMatches);
  const canReplaceSelectedMatches = useAppSelector(state => {
    return selectedMatches.every(matchId => {
      const currentMatch = state.main.clusterDiff.clusterToLocalResourcesMatches.find(m => m.id === matchId);
      return Boolean(currentMatch?.clusterResourceId) && Boolean(currentMatch?.localResourceIds?.length);
    });
  });

  const previewResourceId = useAppSelector(state => state.main.previewResourceId);
  const previewValuesFileId = useAppSelector(state => state.main.previewValuesFileId);

  const [hasAppliedResource, setHasAppliedResource] = useState<boolean>(false);
  const [resourceDiffState, setResourceDiffState] = useState<ResourceDiffState>({isLoading: false});

  const containerRef = useRef<HTMLDivElement>(null);

  const isResourceDiffVisible = useMemo(() => {
    return Boolean(diffResourceId);
  }, [diffResourceId]);

  const loadClusterResourceText = async (localResource: K8sResource) => {
    try {
      const {clusterResourceText} = await getClusterResourceText(localResource, kubeconfigPath, currentContext || '');
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
      return `Comparing kustomization preview resources to Cluster resources (${currentContext})`;
    }
    if (previewValuesFile) {
      return `Comparing Helm Chart preview resources to Cluster resources (${currentContext})`;
    }
    return `Comparing Local Resources to Cluster resources (${currentContext})`;
    // eslint-disable-next-line
  }, [previewResource, previewValuesFile, currentContext, isResourceDiffVisible, closeResourceDiff]);

  const onClickDeploySelected = () => {
    if (!currentContext) {
      return;
    }
    applySelectedMatchesWithConfirm(selectedMatches.length, currentContext, dispatch);
  };

  const onClickReplaceSelected = () => {
    if (!currentContext) {
      return;
    }
    replaceSelectedMatchesWithConfirm(selectedMatches.length, currentContext, dispatch);
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
            disabled={selectedMatches.length === 0 || !currentContext}
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
              disabled={selectedMatches.length === 0 || !canReplaceSelectedMatches || !currentContext}
              onClick={onClickReplaceSelected}
            >
              <ArrowLeftOutlined />
              Replace selected local resources ({selectedMatches.length}) with cluster resources
            </Button>
            <Button onClick={closeModal}>Close</Button>
          </div>
        </StyledButtonsContainer>
      }
      centered
      previewing={isInPreviewMode}
    >
      <ResizableBox
        width={984}
        height={containerRef.current?.offsetHeight || 0}
        minConstraints={[984, containerRef.current?.offsetHeight || 0]}
        maxConstraints={[window.innerWidth - 64, containerRef.current?.offsetHeight || 0]}
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
