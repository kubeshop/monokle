import {Button} from 'antd';

import {rgba} from 'polished';
import styled from 'styled-components';

import Colors from '@styles/Colors';

export const LinkButton = styled(Button)<{$disableHover?: boolean}>`
  border-radius: 4px;
  color: ${Colors.blue6};
  background-color: ${Colors.grey1000};
  padding: 0px 4px;
  border: none;
  font-weight: 600;

  ${({$disableHover}) => {
    if (!$disableHover) {
      return `
        &:hover {
          color: #165996;
          background-color: ${rgba(Colors.grey3b, 0.8)};
        }
      `;
    }
  }}
`;
