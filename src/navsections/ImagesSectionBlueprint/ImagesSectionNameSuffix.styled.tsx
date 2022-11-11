import styled from 'styled-components';

import {Colors, FontColors} from '@monokle-desktop/shared/styles/Colors';

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Counter = styled.span<{$selected: boolean}>`
  ${({$selected}) => `
    color: ${$selected ? Colors.blackPure : FontColors.grey};
  `}

  margin-left: 6px;
  font-size: 12px;
`;
