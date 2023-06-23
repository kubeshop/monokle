import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Container = styled.div`
  display: grid;
  grid-template-rows: repeat(3, 56px);
  width: 100%;
  padding: 0 16px;
`;

export const InnerContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  width: 100%;
`;

export const Count = styled.div<{$small?: boolean}>`
  display: flex;
  gap: 4px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;

  ${({$small}) => ($small ? 'font-size: 12px' : 'font-size: 16px')};
`;

export const KindRow = styled.span<{$type: 'error' | 'warning' | 'resource'}>`
  display: flex;
  align-items: center;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 10px;
  padding: 8px 10px;
  cursor: ${({onClick}) => (onClick ? 'pointer' : 'default')};

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
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
    `}
`;
