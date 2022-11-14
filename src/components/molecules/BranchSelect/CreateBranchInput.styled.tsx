import styled from 'styled-components';

import Colors from '@styles/Colors';

export const CreateBranchInputContainer = styled.div`
  margin: 5px 14px 0px 14px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const ErrorLabel = styled.div`
  color: ${Colors.redError};
  font-size: 12px;
  margin: 6px 0px 0px 14px;
`;
