import {Button} from 'antd';

import styled from 'styled-components';

import {DEFAULT_PANE_TITLE_HEIGHT} from '@constants/constants';

import {AppBorders} from '@shared/styles/borders';
import {BackgroundColors, Colors} from '@shared/styles/colors';

export const FiltersNumber = styled.div`
  margin-left: 5px;
`;

export const List = styled.ol`
  height: 100%;
  list-style-type: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
`;

export const NavigatorPaneContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
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

export const SelectionBar = styled.div`
  height: ${DEFAULT_PANE_TITLE_HEIGHT}px;
  width: 100%;
  border-bottom: ${AppBorders.sectionDivider};
`;

export const TitleBar = styled.div`
  display: flex;
  height: ${DEFAULT_PANE_TITLE_HEIGHT}px;
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
`;
