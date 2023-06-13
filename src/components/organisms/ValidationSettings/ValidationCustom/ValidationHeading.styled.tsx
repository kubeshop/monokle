import {Button as AntdButton} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Heading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 16px;
  background-color: #31393c;
`;

export const HeadingLeft = styled.div`
  display: flex;
  align-items: center;
`;

export const HeadingTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 44px;
`;

export const Name = styled.h1`
  color: ${Colors.whitePure};
  font-size: 16px;
  margin-bottom: 0px;
`;

export const Link = styled.a`
  font-size: 12px;
  color: ${Colors.blue6};
`;

export const Button = styled(AntdButton)`
  color: ${Colors.whitePure};
  background-color: ${Colors.blue7};
`;
