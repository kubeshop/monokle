import styled from 'styled-components';

import Colors from '@styles/Colors';

export const KVDiv = styled.div`
  display: flex;
  border: solid ${Colors.grey5b} 1px;
  border-radius: 4px;
`;

export const KVKey = styled.div``;

export const KVValue = styled.div``;

export const KVOperation = styled.div`
  border-left: solid ${Colors.grey5b} 1px;
  border-right: solid ${Colors.grey5b} 1px;
  color: ${Colors.grey7};
  padding: 0 4px;
`;

export const KVAction = styled.div`
  border-left: solid ${Colors.grey5b} 1px;
`;
