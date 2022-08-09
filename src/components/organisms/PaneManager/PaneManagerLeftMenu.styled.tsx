import {Badge as RawBadge} from 'antd';

import styled from 'styled-components';

import {BackgroundColors, PanelColors} from '@styles/Colors';

export const Badge = styled(RawBadge)`
  & .ant-badge-dot {
    top: 3px;
    right: 3px;
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
  gap: 7px;
`;
