import {Button as ButtonRaw} from 'antd';

import {ExclamationCircleFilled as ExclamationCircleFilledRaw} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 10px 0;
  height: 100%;
`;

export const ExclamationCircleFilled = styled(ExclamationCircleFilledRaw)`
  margin-right: 0.6rem;
  cursor: pointer;
`;

export const Item = styled(ButtonRaw)`
  display: flex;
  padding: 0;
  margin: 0.6rem;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: ${Colors.blue7};
  border: none;
  outline: none;
`;
