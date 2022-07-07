import {Drawer as RawDrawer} from 'antd';

import styled from 'styled-components';

export const Drawer = styled(RawDrawer)`
  z-index: 100;

  & .ant-drawer-body {
    overflow-y: auto;
    overflow-x: hidden;
  }
`;
