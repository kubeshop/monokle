import {Tag as RawTag} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Tag = styled(RawTag)`
  color: rgba(255, 255, 255, 0.72);
  background-color: ${Colors.geekblue4};
  border: none;
  border-radius: 2px;
  font-size: 14px;
  padding: 2px 5px;
  cursor: pointer;

  &:hover {
    background: ${Colors.cyan};
  }
`;
