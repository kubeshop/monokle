import styled from 'styled-components';

import Drawer from '@atoms/Drawer';

export const StyledDrawer = styled(Drawer)`
  & .ant-drawer-body {
    overflow-y: auto;
    overflow-x: hidden;
  }
`;
