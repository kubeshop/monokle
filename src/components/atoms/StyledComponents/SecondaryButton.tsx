import {Button} from 'antd';

import {rgba} from 'polished';
import styled from 'styled-components';

import {Colors} from '@monokle-desktop/shared/styles/colors';

export const SecondaryButton = styled(Button)<{$disableHover?: boolean}>`
  border-radius: 4px;
  color: ${Colors.blue6};
  padding: 0px 14px;
  background-color: ${Colors.grey3b};
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
