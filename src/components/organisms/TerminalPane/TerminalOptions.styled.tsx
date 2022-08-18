import {Divider as RawDivider, Form as RawForm, InputNumber as RawInputNumber} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Divider = styled(RawDivider)`
  margin: 10px 0px 16px 0px;
`;

export const Form = styled(RawForm)`
  & .ant-form-item {
    padding: 0px 10px;

    &-label {
      font-weight: bold;
    }
  }
`;

export const InputNumber = styled(RawInputNumber)`
  width: 100%;
`;

export const TerminalOptionsContainer = styled.div`
  background-color: ${Colors.grey4000};
  padding: 10px 0px 1px 0px;
  width: 200px;
`;
