import {Input as RawInput} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Input = styled(RawInput)`
  background: rgb(12, 13, 14);
`;

export const OptionLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
`;

export const TerminalOptionsContainer = styled.div`
  background-color: ${Colors.grey4000};
  padding: 10px;
  min-width: 150px;
`;
