import React, {useCallback, useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeClusterDiff} from '@redux/reducers/ui';
import {ClusterDiff} from '@molecules';
import {loadClusterDiff} from '@redux/thunks/loadClusterDiff';
import {Skeleton} from 'antd';
import styled from 'styled-components';
import {isInPreviewModeSelector} from '@redux/selectors';

const Container = styled.div`
  display: block;
  margin: 0;
  padding: 0;
  width: 95%;
  height: 100%;
`;

const SkeletonContainer = styled.div`
  padding: 10px;
`;

function ClusterDiffPane() {
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
    <Container>
      {!hasClusterDiffLoaded ? (
        <SkeletonContainer>
          <Skeleton />
        </SkeletonContainer>
      ) : (
        <ClusterDiff />
      )}
    </Container>
  );
}

export default ClusterDiffPane;
