import React, {useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeNavigatorDiff} from '@redux/reducers/ui';
import Drawer from '@components/atoms/Drawer';
import {NavigatorDiff} from '@organisms';
import {loadNavigatorDiff} from '@redux/thunks/loadNavigatorDiff';
import {Skeleton} from 'antd';

function NavigatorDiffDrawer() {
  const dispatch = useAppDispatch();

  const hasNavigatorDiffLoaded = useAppSelector(state => state.main.hasNavigatorDiffLoaded);
  const isNavigatorDiffVisible = useAppSelector(state => state.ui.isNavigatorDiffVisible);
  const closeDrawer = () => {
    dispatch(closeNavigatorDiff());
  };

  useEffect(() => {
    if (isNavigatorDiffVisible && !hasNavigatorDiffLoaded) {
      dispatch(loadNavigatorDiff());
    }
  }, [isNavigatorDiffVisible, hasNavigatorDiffLoaded, dispatch]);

  return (
    <Drawer
      width="800"
      noborder="true"
      title="Navigator Diff"
      placement="left"
      closable={false}
      onClose={closeDrawer}
      visible={isNavigatorDiffVisible}
    >
      {hasNavigatorDiffLoaded ? <NavigatorDiff hideTitleBar /> : <Skeleton />}
    </Drawer>
  );
}

export default NavigatorDiffDrawer;
