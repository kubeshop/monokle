import React, {useCallback, useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeNavigatorDiff} from '@redux/reducers/ui';
import {NavigatorDiff} from '@molecules';
import {loadNavigatorDiff} from '@redux/thunks/loadNavigatorDiff';
import {Skeleton} from 'antd';
import styled from 'styled-components';

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

function NavigatorDiffPane() {
  const dispatch = useAppDispatch();

  const hasNavigatorDiffLoaded = useAppSelector(state => state.main.navigatorDiff.hasLoaded);
  const hasNavigatorDiffFailed = useAppSelector(state => state.main.navigatorDiff.hasFailed);
  const isNavigatorDiffVisible = useAppSelector(state => state.ui.isNavigatorDiffVisible);

  const closeDrawer = useCallback(() => {
    dispatch(closeNavigatorDiff());
  }, [dispatch]);

  useEffect(() => {
    if (isNavigatorDiffVisible && !hasNavigatorDiffLoaded) {
      dispatch(loadNavigatorDiff());
    }
  }, [isNavigatorDiffVisible, hasNavigatorDiffLoaded, dispatch]);

  useEffect(() => {
    if (hasNavigatorDiffFailed) {
      closeDrawer();
    }
  }, [hasNavigatorDiffFailed, closeDrawer]);

  return (
    <Container>
      {!hasNavigatorDiffLoaded ? (
        <SkeletonContainer>
          <Skeleton />
        </SkeletonContainer>
      ) : (
        <NavigatorDiff />
      )}
    </Container>
  );
}

export default NavigatorDiffPane;
