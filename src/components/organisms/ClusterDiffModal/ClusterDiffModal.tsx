import {Button, Modal, Skeleton} from 'antd';
import React, {useCallback, useEffect, useMemo} from 'react';
import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeClusterDiff} from '@redux/reducers/ui';
import {isInPreviewModeSelector} from '@redux/selectors';
import {loadClusterDiff} from '@redux/thunks/loadClusterDiff';

import {ClusterDiff} from '@molecules';

const Container = styled.div`
  display: block;
  margin: 0;
  padding: 0;
  height: 70vh;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
`;

const SkeletonContainer = styled.div`
  padding: 10px;
`;

const StyledModal = styled(Modal)`
  & .ant-modal-body {
    padding: 8px;
  }
`;

function ClusterDiffModal() {
  const dispatch = useAppDispatch();

  const hasClusterDiffLoaded = useAppSelector(state => state.main.clusterDiff.hasLoaded);
  const hasClusterDiffFailed = useAppSelector(state => state.main.clusterDiff.hasFailed);
  const isClusterDiffVisible = useAppSelector(state => state.ui.isClusterDiffVisible);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isApplyingResource = useAppSelector(state => state.main.isApplyingResource);
  const currentContext = useAppSelector(state => state.config.kubeConfig.currentContext);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);

  const previewResourceId = useAppSelector(state => state.main.previewResourceId);
  const previewValuesFileId = useAppSelector(state => state.main.previewValuesFileId);

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
    if (!isApplyingResource && isClusterDiffVisible) {
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
    if (previewResource) {
      return `Comparing kustomization preview resources to Cluster resources (${currentContext})`;
    }
    if (previewValuesFile) {
      return `Comparing Helm Chart preview resources to Cluster resources (${currentContext})`;
    }
    return `Comparing Local Resources to Cluster resources (${currentContext})`;
  }, [previewResource, previewValuesFile, currentContext]);

  return (
    <StyledModal
      title={title}
      visible={isClusterDiffVisible}
      width={1000}
      onCancel={closeDrawer}
      footer={<Button onClick={closeDrawer}>Close</Button>}
    >
      <Container>
        {!hasClusterDiffLoaded ? (
          <SkeletonContainer>
            <Skeleton />
          </SkeletonContainer>
        ) : (
          <ClusterDiff />
        )}
      </Container>
    </StyledModal>
  );
}

export default ClusterDiffModal;
