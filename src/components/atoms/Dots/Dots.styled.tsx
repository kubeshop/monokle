import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Dot = styled.div<{$color: Colors}>`
  width: 3px;
  height: 3px;
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
