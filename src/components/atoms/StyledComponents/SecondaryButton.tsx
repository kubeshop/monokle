import {Button} from 'antd';

import {rgba} from 'polished';
import styled from 'styled-components';

import Colors from '@styles/Colors';

export const SecondaryButton = styled(Button)`
  border-radius: 4px;
  color: ${Colors.blue6};
  padding: 0px 14px;
  background-color: ${Colors.grey3b};
  border: none;
  font-weight: 600;

  &:hover {
    color: #165996;
    background-color: ${rgba(Colors.grey3b, 0.8)};
  }
`;
