import {Button as ButtonRaw} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
  margin-top: 10px;
`;

export const Item = styled(ButtonRaw)`
  display: flex;
  padding: 0;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: ${Colors.blue7};
  border: none;
  outline: none;
`;
