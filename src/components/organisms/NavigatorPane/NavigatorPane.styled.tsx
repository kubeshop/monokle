import {Button} from 'antd';

import styled from 'styled-components';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import {AppBorders} from '@styles/Borders';
import Colors, {BackgroundColors} from '@styles/Colors';

export const FiltersContainer = styled.div`
  position: relative;
  padding: 6px 0 3px 0;
  margin-bottom: 5px;

  & .react-resizable {
    padding: 8px 16px;
    overflow-y: auto;

    ${GlobalScrollbarStyle}
  }

  & .custom-handle {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -4px;
    height: 3px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    cursor: row-resize;
  }
`;

export const FiltersNumber = styled.div`
  margin-left: 5px;
`;

export const List = styled.ol`
  height: 100%;
  list-style-type: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;

  ${GlobalScrollbarStyle}
`;

export const NavigatorPaneContainer = styled.div<{$gridTemplateRows: string}>`
  height: 100%;
  display: grid;

  ${({$gridTemplateRows}) => `
    grid-template-rows: ${$gridTemplateRows};
  `};
  grid-row-gap: 5px;
`;

export const PlusButton = styled(Button)<{$highlighted: boolean; $disabled: boolean}>`
  ${({$disabled, $highlighted}) => `
    border-radius: ${$highlighted ? '100%' : 'inherit'} !important;
    color: ${$highlighted ? Colors.whitePure : $disabled ? 'rgba(255, 255, 255, 0.3)' : Colors.blue6} !important`};

  &:after {
    ${({$highlighted}) => `
      height: ${$highlighted ? '24px' : 'inherit'};
      width: ${$highlighted ? '24px' : 'inherit'};
      top: ${$highlighted ? '-1px' : 'inherit'};
      left: ${$highlighted ? '-1px' : 'inherit'}
    `};
  }
`;

export const TitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: ${AppBorders.sectionDivider};
  width: 100%;
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
