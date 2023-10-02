import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Count = styled.span<{$type: 'warning' | 'error'}>`
  font-size: 12px;
  font-weight: 400;
  color: ${({$type}) => ($type === 'warning' ? Colors.yellow12 : Colors.red7)};
`;

export const NavigatorDescriptionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

export const ProblemCountContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
`;

export const ResourcesCount = styled.span<{$isPreview: boolean}>`
  font-size: 10px;
  font-weight: 700;
  color: ${props => (props.$isPreview ? Colors.dryRun : Colors.grey6)};
`;

export const WarningsErrorsContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;
