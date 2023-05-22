import {Button} from 'antd';

import {rgba} from 'polished';
import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const SecondaryButton = styled(Button)<{$disableHover?: boolean}>`
  border-radius: 4px;
  color: ${Colors.blue7};
  padding: 0px 16px;
  background-color: ${Colors.grey3};
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
