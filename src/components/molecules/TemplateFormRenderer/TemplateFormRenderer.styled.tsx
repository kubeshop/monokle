import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const ErrorText = styled.div`
  font-size: 14px;
`;

export const ReadMoreLink = styled.a`
  color: ${Colors.blue6};
  cursor: pointer;
`;

export const ErrorContainer = styled.div`
  padding: 10px;
  border: 1px solid ${Colors.red10};
  background-color: ${Colors.red100};
  display: flex;
  align-items: center;
  border-radius: 2px;
`;
