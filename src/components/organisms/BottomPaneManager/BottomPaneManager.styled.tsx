import styled from 'styled-components';

import {AppBorders} from '@styles/Borders';
import {PanelColors} from '@styles/Colors';

export const BottomPaneManagerContainer = styled.div`
  height: 100%;
  border-left: 9px solid ${PanelColors.toolBar};
  padding: 8px 16px;
`;

export const Tab = styled.div<{$selected: boolean}>`
  font-weight: ${({$selected}) => ($selected ? '700' : '400')};

  padding: 10px;
  cursor: pointer;
  border: ${AppBorders.sectionDivider};
`;

export const TabsContainer = styled.div`
  display: flex;
`;
