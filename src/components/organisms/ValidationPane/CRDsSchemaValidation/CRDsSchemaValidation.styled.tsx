import {Button, Input} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div`
  margin: 16px;
`;

export const List = styled.ol`
  margin-bottom: 0;
`;

export const RegisterContainer = styled.div`
  background-color: ${Colors.grey1};
  padding: 16px;
`;

export const RegisterInput = styled(Input)`
  margin-bottom: 8px;
`;

export const Subtitle = styled.h2`
  margin-top: 16px;
`;

export const CancelButton = styled(Button)`
  margin-right: 8px;
`;
