import styled from 'styled-components';

import Colors from '@styles/Colors';

export const ReplaceSpan = styled.span<{$isSelected: boolean}>`
  font-weight: 500;
  font-size: 12px;
  margin: 0 15px 0 5px;
  cursor: pointer;
  color: ${({$isSelected}) => ($isSelected ? Colors.blackPure : Colors.blue6)};
`;
