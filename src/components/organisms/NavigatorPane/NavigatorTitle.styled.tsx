import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const ColoredBox = styled.div<{$type: 'warning' | 'error'}>`
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background-color: ${({$type}) => ($type === 'warning' ? Colors.yellow12 : Colors.red7)};
`;

export const Count = styled.span<{$type: 'warning' | 'error'}>`
  font-size: 12px;
  font-weight: 400;
  margin: 0px 8px 0px 0px;
  color: ${({$type}) => ($type === 'warning' ? Colors.yellow12 : Colors.red7)};
`;

export const NavigatorTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

export const WarningsErrorsContainer = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
`;
