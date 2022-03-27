import styled from 'styled-components';

import Drawer from '@atoms/Drawer';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

export const StyledDrawer = styled(Drawer)`
  & .ant-drawer-body {
    overflow-y: auto;
    overflow-x: hidden;
    ${GlobalScrollbarStyle}
  }
`;
