import {Badge as RawBadge} from 'antd';

import styled from 'styled-components';

import {BackgroundColors, PanelColors} from '@styles/Colors';

export const Badge = styled(RawBadge)`
  & .ant-badge-dot {
    top: 3px;
    right: 3px;
  }
`;

export const Container = styled.div<{isLeftActive: boolean}>`
  height: 100%;
  width: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: content-box;
  gap: 7px;
  background-color: ${props => (props.isLeftActive ? BackgroundColors.darkThemeBackground : PanelColors.toolBar)}};
`;
