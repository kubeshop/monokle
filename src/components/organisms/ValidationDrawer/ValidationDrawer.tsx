import React from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {toggleValidationDrawer} from '@redux/reducers/ui';

import Drawer from '@components/atoms/Drawer';

function ValidationPane({height}: {height: number}) {
  const dispatch = useAppDispatch();
  const isVisible = useAppSelector(state => state.ui.leftMenu.isValidationDrawerVisible);

  return (
    <Drawer
      key="validation-pane"
      title="Validate your resources"
      size="large"
      placement="left"
      visible={isVisible}
      closable={false}
      onClose={() => dispatch(toggleValidationDrawer())}
      getContainer={false}
      style={{
        position: 'absolute',
        height,
        overflow: 'hidden',
      }}
    >
      <p>Some contents...</p>
      <p>Where is my content?...</p>
      <p>Some contents...</p>
    </Drawer>
  );
}

export default ValidationPane;
