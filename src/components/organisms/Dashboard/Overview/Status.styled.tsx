import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0 24px;
`;

export const InnerContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const Count = styled.span`
  font-weight: 600;
  margin-right: 4px;
`;

export const KindRow = styled.div<{$type: string}>`
  display: flex;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;

  ${props =>
    `border-left: 4px solid ${
      (props.$type === 'warning' && Colors.yellow12) ||
      (props.$type === 'error' && Colors.red7) ||
      (props.$type === 'resource' && Colors.grey5000)
    };
    background-color: ${
      (props.$type === 'warning' && 'rgba(232, 179, 57, 0.1)') ||
      (props.$type === 'error' && 'rgba(232, 71, 73, 0.1)') ||
      (props.$type === 'resource' && 'rgba(82, 115, 224, 0.1)')
    };
    color: ${
      (props.$type === 'warning' && Colors.yellow12) ||
      (props.$type === 'error' && Colors.red7) ||
      (props.$type === 'resource' && Colors.geekblue7)
    };
    font-size: ${
      (props.$type === 'warning' && '17px') ||
      (props.$type === 'error' && '17px') ||
      (props.$type === 'resource' && '21px')
    };`}
`;
