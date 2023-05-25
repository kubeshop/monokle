import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const ErrorContainer = styled.div`
  padding: 10px;
  color: ${Colors.red6};
`;

export const LogContainer = styled.div`
  padding: 12px;
  height: 100%;
  overflow: auto;
  background-color: ${Colors.blackPure};
`;

export const LogText = styled.div`
  font-size: 12px;
  font-family: monospace;
  font-weight: 600;
  color: ${Colors.whitePure};
  white-space: nowrap;
`;
