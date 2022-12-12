import {Button as AntdButton, Card as AntdCard} from 'antd';

import styled from 'styled-components';

import {Icon as BaseIcon} from '@atoms';

import {Colors} from '@shared/styles/colors';

export const TutorialReferenceLink = styled(AntdCard)`
  border: 2px solid ${Colors.coldGrey};
  border-radius: 2px;
  flex-grow: 1;
  min-height: 100px;
  .ant-card-body {
    background-color: ${Colors.coldGrey};
    height: 100%;
    min-height: 100px;
    font-size: 14px;
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
`;

export const Button = styled(AntdButton)`
  color: ${Colors.whitePure};
  background-color: ${Colors.blue7};
  margin-top: 10px;
  display: block;
`;
