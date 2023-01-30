import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const ItemContainer = styled.div<{$selected: boolean}>`
  color: ${Colors.whitePure};
  padding: 5px 0px 5px 49px;
  background-color: ${({$selected}) => ($selected ? Colors.blue9 : 'transparent')};
  color: ${({$selected}) => ($selected ? Colors.grey2 : Colors.whitePure)};

  &:hover {
    cursor: pointer;
    background-color: ${({$selected}) => ($selected ? Colors.blue8 : 'rgba(141, 207, 248, 0.15)')};
  }
`;
