import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Label = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${Colors.grey9};
  margin-bottom: 8px;
`;

export const Field = styled.div`
  margin-top: 6px;
  margin-bottom: 30px;
`;

export const Description = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${Colors.grey7};
`;

export const ActionsContainer = styled.div`
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;
