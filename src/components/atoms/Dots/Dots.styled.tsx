import styled from 'styled-components';

import {Colors} from '@monokle-desktop/shared/styles/Colors';

export const Dot = styled.div<{$color: Colors}>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${props => props.$color};
`;

export const DotsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3px;
  height: inherit;
`;
