import * as React from 'react';
import styled from 'styled-components';
import { SettingOutlined } from '@ant-design/icons';

import {useAppSelector, useAppDispatch} from '@redux/hooks';
import {toggleSettings} from '@redux/reducers/ui';
import Drawer from '@components/atoms/Drawer';

const StyledSettingsIcon = styled(SettingOutlined)`
  padding: 4px;
`;

const SettingsDrawer = () => {
  const dispatch = useAppDispatch();
  const isSettingsOpened = !!useAppSelector(state => state.ui.settingsOpened);

  const toggleSettingsDrawer = () => {
    dispatch(toggleSettings());
  };

  return (
    <Drawer
      noborder
      title="Settings"
      placement="right"
      closable={false}
      onClose={toggleSettingsDrawer}
      visible={isSettingsOpened}
    >
      <StyledSettingsIcon style={{ fontSize: '1.5em' }}/>
    </Drawer>
  );
};

export default SettingsDrawer;
