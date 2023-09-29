import AntdIcon from '@ant-design/icons';

import styled from 'styled-components';

import {DEFAULT_PANE_TITLE_HEIGHT} from '@constants/constants';

import {PrimaryButton} from '@components/atoms';

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
  background-color: ${Colors.black100};
`;

export const NewButton = styled(PrimaryButton)`
  padding: 0px 8px;
  font-size: 12px;
  border-radius: 2px;
  font-weight: 500;
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

export const FullscreenOutlined = styled(AntdIcon)<{$disabled: boolean}>`
  color: ${({$disabled}) => ($disabled ? Colors.grey6 : Colors.blue6)};
  cursor: ${({$disabled}) => ($disabled ? 'not-allowed' : 'pointer')};
  padding-right: 10px;
  font-size: 16px;
`;

export const FullscreenExitOutlined = styled(AntdIcon)<{$disabled: boolean}>`
  color: ${({$disabled}) => ($disabled ? Colors.grey6 : Colors.blue6)};
  cursor: ${({$disabled}) => ($disabled ? 'not-allowed' : 'pointer')};
  padding-right: 10px;
  font-size: 16px;
`;
