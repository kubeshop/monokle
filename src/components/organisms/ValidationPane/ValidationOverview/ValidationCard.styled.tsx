import {Button as AntdButton, Card as AntdCard} from 'antd';

import styled from 'styled-components';

import {Icon as BaseIcon} from '@atoms';

import Colors from '@styles/Colors';

export const Card = styled(AntdCard)`
  border: 2px solid #31393c;
  border-radius: 2px;
  height: 100%;

  .ant-card-body {
    background-color: #31393c;
    height: 100%;
  }
`;

export const Icon = styled(BaseIcon)`
  font-size: 32px;
`;

export const Name = styled.h1`
  color: ${Colors.whitePure};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 6px;
  margin-bottom: 6px;
  font-size: 16px;
`;

export const Description = styled.span`
  color: ${Colors.grey8};
`;

export const Link = styled.a`
  color: ${Colors.blue7};
  margin-left: 5px;
`;

export const Button = styled(AntdButton)`
  color: ${Colors.whitePure};
  background-color: ${Colors.blue7};
  margin-top: 10px;
  display: block;
`;
