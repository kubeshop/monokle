import styled from 'styled-components';

import Colors, {FontColors} from '@styles/Colors';

export const Counter = styled.span<{$selected: boolean}>`
  ${({$selected}) => `
    color: ${$selected ? Colors.blackPure : FontColors.grey};
  `}

  margin-left: 6px;
  font-size: 12px;
`;
