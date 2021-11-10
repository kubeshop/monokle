import {Button} from 'antd';
import styled from 'styled-components';

import {AppBorders} from '@styles/Borders';
import {BackgroundColors} from '@styles/Colors';

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

export const TitleBar = styled.div`
  display: flex;
  height: 24px;
  justify-content: space-between;
  border-bottom: ${AppBorders.sectionDivider};
  width: 100%;
  height: 40px;
  margin: 0;
  padding: 0;
  background: ${BackgroundColors.darkThemeBackground};
  overflow: hidden;
`;

export const TitleBarRightButtons = styled.div`
  float: right;
  display: flex;
  align-items: center;
  padding-right: 16px;
`;

export const PlusButton = styled(Button)``;

export const FilterButton = styled(Button)``;

export const FiltersNumber = styled.div`
  margin-left: 5px;
`;
