import styled from 'styled-components';

import {AppBorders} from '@styles/Borders';
import {BackgroundColors} from '@styles/Colors';

export const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const RightButtons = styled.div`
  display: flex;
  align-items: center;
`;

export const TitleBarContainer = styled.div`
  width: 100%;
  border-bottom: ${AppBorders.sectionDivider};
  background: ${BackgroundColors.darkThemeBackground};
`;
