import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const ErrorContainer = styled.div`
  padding: 10px;
  color: ${Colors.red6};
`;

export const LogContainer = styled.div`
  padding: 12px;
  height: 100%;
  overflow-x: auto;
  background-color: ${Colors.grey1};
  display: grid;
  grid-template-rows: max-content 1fr;
`;

export const LogText = styled.div`
  font-size: 12px;
  font-family: monospace;
  font-weight: 600;
  color: ${Colors.whitePure};
  white-space: nowrap;
`;

export const LogsContainer = styled.div`
  overflow-y: auto;
  height: 100%;
  padding-right: 8px;
`;
