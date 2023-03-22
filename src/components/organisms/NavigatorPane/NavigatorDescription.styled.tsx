import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Count = styled.span<{$type: 'warning' | 'error'}>`
  font-size: 12px;
  font-weight: 400;
  margin: 0px 8px 0px 0px;
  color: ${({$type}) => ($type === 'warning' ? Colors.yellow12 : Colors.red7)};
`;

export const NavigatorDescriptionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

export const ResourcesCount = styled.span`
  color: ${Colors.grey6};
  font-size: 10px;
  font-weight: 700;
`;

export const WarningsErrorsContainer = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
`;
