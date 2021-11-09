import {Button, Modal, Skeleton} from 'antd';
import React, {useCallback, useEffect} from 'react';
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

  useEffect(() => {
    dispatch(loadClusterDiff());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInPreviewMode]);

  // TODO: improve this by updating the clusterToLocalResourcesMatches after apply instead of reloading the entire cluster diff
  useEffect(() => {
    if (!isApplyingResource) {
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

  return (
    <StyledModal
      title="Comparing Local Resources to Cluster Resources"
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
