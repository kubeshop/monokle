import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Container = styled.div`
  display: flex;
  align-items: center;
  span > span.anticon {
    font-size: 16px;
    padding: 4px;
  }
`;

export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 5px;
`;

export const ErrorText = styled.span<{$type: string}>`
  font-size: 12px;
  color: ${({$type}) => ($type === 'error' ? Colors.redError : $type === 'warning' ? Colors.yellowWarning : 'inherit')};
`;
