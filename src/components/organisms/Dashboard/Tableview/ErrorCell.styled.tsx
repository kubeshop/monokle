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

export const RenderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 8px;
`;

export const ErrorText = styled.span<{$type: string}>`
  font-size: 12px;
  color: ${({$type}) => ($type === 'error' ? Colors.redError : $type === 'warning' ? Colors.yellowWarning : 'inherit')};
`;
