import {Button} from 'antd';

import styled from 'styled-components';

export const IconButton = styled(Button)<{$size?: 'small' | 'medium' | 'large'}>`
  border-radius: 50%;
  padding: ${({$size}) => ($size === 'small' ? '2px 4px' : $size === 'medium' || !$size ? '4px 9px' : '3px 8px')};
  border: none;
  background-color: rgba(255, 255, 255, 0.07);
  font-size: ${({$size}) => ($size === 'small' ? '12' : $size === 'medium' || !$size ? '14' : '16')}px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.07);
    color: #165996;
  }

  &:active,
  &:focus {
    background-color: rgba(255, 255, 255, 0.07);
  }
`;
