import {Badge as RawBadge} from 'antd';

import styled from 'styled-components';

import {BackgroundColors, PanelColors} from '@styles/Colors';

export const Badge = styled(RawBadge)`
  & .ant-badge-count {
    top: 4px;
    right: 0px;
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
  gap: 9px;
`;
