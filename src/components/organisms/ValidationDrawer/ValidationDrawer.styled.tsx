import styled from 'styled-components';

import BaseDrawer, {DrawerProps as BaseDrawerProps} from '@components/atoms/Drawer';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

type DrawerProps = BaseDrawerProps & {
  height: number;
};

export const Drawer = styled((props: DrawerProps) => <BaseDrawer {...props} />)`
  position: absolute;
  height: ${props => props.height};
  overflow: hidden;

  .ant-drawer-wrapper-body {
    background-color: #191f21;
  }

  .ant-drawer-header {
    background-color: #191f21;
    padding-left: 16px;
    padding-top: 8px;
    padding-right: 4px;
    padding-bottom: 8px;
  }

  .ant-drawer-body {
    ${GlobalScrollbarStyle}
  }
`;
