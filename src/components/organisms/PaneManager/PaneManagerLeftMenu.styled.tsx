import {Badge as RawBadge} from 'antd';

import styled from 'styled-components';

import {BackgroundColors, Colors, PanelColors} from '@monokle-desktop/shared/styles';

export const Badge = styled(RawBadge)`
  & .ant-badge-dot {
    top: 6px;
    right: 6px;
    z-index: 100;
    background-color: ${Colors.geekblue6} !important;
  }

  & .ant-badge-count {
    top: 5px;
    right: 5px;
    z-index: 100;
    padding: 0px 4px;
    background-color: ${Colors.geekblue6} !important;
  }

  & .ant-badge-count-sm {
    min-width: 12px;
    height: 12px;
    font-size: 8px;
    line-height: 11px;
  }
`;

export const Container = styled.div<{$isLeftActive: boolean}>`
  height: 100%;
  width: 50px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: content-box;
  background-color: ${props => (props.$isLeftActive ? BackgroundColors.darkThemeBackground : PanelColors.toolBar)};
`;

export const IconsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
