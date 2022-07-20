import styled from 'styled-components';

import {AppBorders} from '@styles/Borders';

export const BottomPaneManagerContainer = styled.div<{$height: number}>`
  height: ${({$height}) => $height || 200}px;
  border-left: ${AppBorders.sectionDivider};
  border-top: ${AppBorders.sectionDivider};
  padding: 8px 16px;
`;
