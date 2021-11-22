import styled from 'styled-components';

import {AppBorders} from '@styles/Borders';
import {BackgroundColors} from '@styles/Colors';

export const Container = styled.div`
  display: flex;
  height: 24px;
  justify-content: space-between;
  border-bottom: ${AppBorders.sectionDivider};
  width: 100%;
  height: 40px;
  margin: 0;
  padding: 0;
  background: ${BackgroundColors.darkThemeBackground};
`;

export const RightButtons = styled.div`
  float: right;
  display: flex;
  align-items: center;
`;
