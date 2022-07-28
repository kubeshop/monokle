import styled from 'styled-components';

import {AppBorders} from '@styles/Borders';

export const BottomPaneManagerContainer = styled.div`
  height: 100%;
  border-left: ${AppBorders.sectionDivider};
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
