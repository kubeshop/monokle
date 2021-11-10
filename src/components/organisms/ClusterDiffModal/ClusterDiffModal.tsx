import {Button, Modal, Skeleton, message} from 'antd';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setClusterDiffRefreshDiffResource, setDiffResourceInClusterDiff} from '@redux/reducers/main';
import {closeClusterDiff} from '@redux/reducers/ui';
import {isInPreviewModeSelector} from '@redux/selectors';
import {getClusterResourceText} from '@redux/services/clusterResource';
import {loadClusterDiff} from '@redux/thunks/loadClusterDiff';

import {K8sResource} from '@models/k8sresource';

import {ClusterDiff, ResourceDiff} from '@molecules';

import {ArrowLeftOutlined} from '@ant-design/icons';

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

const StyledModal = styled(Modal)`
  & .ant-modal-body {
    padding: 8px;
  }
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

  const previewResourceId = useAppSelector(state => state.main.previewResourceId);
  const previewValuesFileId = useAppSelector(state => state.main.previewValuesFileId);

  const [hasAppliedResource, setHasAppliedResource] = useState<boolean>(false);
  const [resourceDiffState, setResourceDiffState] = useState<ResourceDiffState>({isLoading: false});

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

  useEffect(() => {
    if (isClusterDiffVisible) {
      dispatch(loadClusterDiff());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInPreviewMode]);

  // TODO: improve this by updating the clusterToLocalResourcesMatches after apply instead of reloading the entire cluster diff
  useEffect(() => {
    if (!isApplyingResource && isClusterDiffVisible && !refreshDiffResource) {
      dispatch(loadClusterDiff());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApplyingResource]);

  const closeDrawer = useCallback(() => {
    dispatch(closeClusterDiff());
  }, [dispatch]);

  useEffect(() => {
    if (isClusterDiffVisible && !hasClusterDiffLoaded) {
      dispatch(loadClusterDiff());
    }
  }, [isClusterDiffVisible, hasClusterDiffLoaded, dispatch]);

  useEffect(() => {
    if (hasClusterDiffFailed) {
      closeDrawer();
    }
  }, [hasClusterDiffFailed, closeDrawer]);

  const title = useMemo(() => {
    if (isResourceDiffVisible) {
      return (
        <>
          <span onClick={closeResourceDiff} style={{cursor: 'pointer'}}>
            <ArrowLeftOutlined style={{marginRight: 8}} />
            Back to Cluster Comparison
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

  return (
    <StyledModal
      title={title}
      visible={isClusterDiffVisible}
      width="90vw"
      style={{maxWidth: 1000}}
      onCancel={closeDrawer}
      footer={<Button onClick={closeDrawer}>Close</Button>}
      centered
    >
      <Container>
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
    </StyledModal>
  );
}

export default ClusterDiffModal;
