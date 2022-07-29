import {InfoCircleOutlined as RawInfoCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const InfoCircleOutlined = styled(RawInfoCircleOutlined)<{isSelected: boolean}>`
  ${props => {
    if (props.isSelected) {
      return `color: ${Colors.blackPure};`;
    }
    return `color: ${Colors.blue9};`;
  }};
  padding: 0 5px;
`;
