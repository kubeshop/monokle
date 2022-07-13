import {Badge as RawBadge} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Badge = styled(RawBadge)<{$type: 'error' | 'warning'}>`
  padding-left: 6px;
  cursor: pointer;

  & .ant-badge-count {
    ${({$type}) => `
      background-color: ${$type === 'error' ? Colors.red7 : Colors.yellow8};
    `}

    display: flex;
    align-items: center;
    justify-content: center;

    & .ant-scroll-number-only {
      ${({$type}) => `
        color: ${$type === 'error' ? Colors.whitePure : Colors.blackPure};
      `}

      font-size: 10px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

export const Counter = styled.span`
  padding: 0 4px 0 8px;
  cursor: pointer;
`;
