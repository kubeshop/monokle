import React from 'react';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {toggleNavigatorDiff} from '@redux/reducers/ui';
import Drawer from '@components/atoms/Drawer';
import {NavigatorDiff} from '@organisms';

function NavigatorDiffDrawer() {
  const dispatch = useAppDispatch();

  const isNavigatorDiffVisible = useAppSelector(state => state.ui.isNavigatorDiffVisible);
  const toggleDrawer = () => {
    dispatch(toggleNavigatorDiff());
  };

  return (
    <Drawer
      width="800"
      noborder="true"
      title="Navigator Diff"
      placement="left"
      closable={false}
      onClose={toggleDrawer}
      visible={isNavigatorDiffVisible}
    >
      <NavigatorDiff hideTitleBar />
    </Drawer>
  );
}

export default NavigatorDiffDrawer;
