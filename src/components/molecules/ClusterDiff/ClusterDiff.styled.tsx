import styled from 'styled-components';
import {AppBorders} from '@styles/Borders';
import {BackgroundColors} from '@styles/Colors';

export const TitleBar = styled.div`
  display: flex;
  align-items: center;
  height: 24px;
  border-bottom: ${AppBorders.sectionDivider};
  width: 100%;
  height: 40px;
  margin: 0;
  padding: 0;
  background: ${BackgroundColors.darkThemeBackground};
`;

export const TitleBarRightButtons = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;
`;

export const List = styled.ol<{height: number}>`
  list-style-type: none;
  padding: 0;
  overflow-y: auto;
  ::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
  ${props => `height: ${props.height}px;`}
  padding-bottom: 20px;
`;
