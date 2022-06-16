import {Button as AntdButton} from 'antd';

import styled from 'styled-components';

import {Icon as BaseIcon} from '@components/atoms';

import Colors from '@styles/Colors';

export const Heading = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 18px 16px;
  background-color: #31393c;
  border-radius: 2px;
`;

export const HeadingLeft = styled.div`
  display: flex;
  flex-direction: row;
`;

export const HeadingTextContainer = styled.div`
  display: flex;
  align-items: baseline;
`;

export const Icon = styled(BaseIcon)`
  font-size: 32px;
`;

export const Name = styled.h1`
  color: ${Colors.whitePure};
  font-size: 20px;
  margin-left: 16px;
  margin-right: 12px;
  margin-bottom: 0px;
`;

export const Link = styled.a`
  color: ${Colors.blue6};
`;

export const Button = styled(AntdButton)`
  color: ${Colors.whitePure};
  background-color: ${Colors.blue7};
`;
