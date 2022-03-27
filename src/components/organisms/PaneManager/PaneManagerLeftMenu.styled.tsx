import {Badge as RawBadge} from 'antd';

import styled from 'styled-components';

import {AppBorders} from '@styles/Borders';

export const Badge = styled(RawBadge)`
  & .ant-badge-dot {
    top: 3px;
    right: 3px;
  }
`;

export const Container = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  padding-right: 4px;
  flex-direction: column;
  gap: 7px;
  border-right: ${AppBorders.pageDivider};
`;
