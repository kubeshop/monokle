import {Button as AntdButton, Card as AntdCard} from 'antd';

import AntdIcon from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const ListContainer = styled(AntdCard)`
  border: 2px solid ${Colors.coldGrey};
  border-radius: 2px;
  display: flex;
  flex-grow: 1;
  flex-basis: 0;
  min-height: 275px;
  .ant-card-body {
    background-color: ${Colors.blueBgColor};
    height: 100%;
  }
`;

export const Icon = styled(AntdIcon)`
  font-size: 14px;
  margin: 8px;
  color: ${Colors.geekblue7};
  background: ${Colors.blueWrapperColor};
`;

export const Name = styled.h1`
  color: ${Colors.whitePure};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 6px;
  margin-bottom: 12px;
  font-size: 16px;
`;

export const Description = styled.span`
  color: ${Colors.grey8};
`;

export const Link = styled.a`
  color: ${Colors.blue7};
  margin-left: 5px;
  float: left;
  padding-top: 19px;
  padding-left: 19px;
`;

export const Button = styled(AntdButton)`
  color: ${Colors.whitePure};
  background-color: ${Colors.blue7};
  margin-top: 16px;
  display: block;
  float: left;
`;

export const Span = styled.span`
  margin-top: 10px;
  display: inline-block;
  width: 100%;
`;

export const ElipseWrapper = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-bottom: 12px;
  background: ${Colors.blueWrapperColor};
`;
