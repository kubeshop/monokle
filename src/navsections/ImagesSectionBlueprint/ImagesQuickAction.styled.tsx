import styled from 'styled-components';

import {Colors} from '@monokle-desktop/shared/styles/colors';

export const ReplaceSpan = styled.span<{$isDisabled: boolean; $isSelected: boolean}>`
  font-weight: 500;
  font-size: 12px;
  margin: 0 15px 0 5px;
  color: ${({$isDisabled, $isSelected}) =>
    $isSelected ? Colors.blackPure : $isDisabled ? Colors.grey6 : Colors.blue6};
  cursor: ${({$isDisabled}) => ($isDisabled ? 'not-allowed' : 'pointer')};
`;
