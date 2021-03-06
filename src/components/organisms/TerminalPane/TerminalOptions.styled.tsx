import {Form as RawForm, InputNumber as RawInputNumber} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Form = styled(RawForm)`
  & label {
    font-weight: bold;
  }
`;

export const InputNumber = styled(RawInputNumber)`
  width: 100%;
`;

export const TerminalOptionsContainer = styled.div`
  background-color: ${Colors.grey4000};
  padding: 10px 10px 1px 10px;
  width: 150px;
`;
