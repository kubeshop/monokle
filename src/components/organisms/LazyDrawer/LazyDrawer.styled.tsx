import {Drawer as RawDrawer} from 'antd';

import styled from 'styled-components';

export const Drawer = styled(RawDrawer)`
  z-index: 1000;

  & .ant-drawer-close {
    position: absolute;
    right: 0px;
  }

  & .ant-drawer-extra {
    margin-right: 20px;
  }

  & .ant-drawer-body {
    overflow-y: auto;
    overflow-x: hidden;
  }
`;
