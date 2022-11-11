import styled from 'styled-components';

import {Colors} from '@monokle-desktop/shared/styles/Colors';

export const Container = styled.span`
  display: flex;
  align-items: center;
`;

export const PreviewSpan = styled.span<{isItemSelected: boolean}>`
  font-weight: 500;
  font-size: 12px;
  cursor: pointer;
  color: ${props => (props.isItemSelected ? Colors.blackPure : Colors.blue6)};
  margin-left: 5px;
  margin-right: 15px;
`;
