import {Button as AntdButton} from 'antd';

import styled from 'styled-components';

import {Icon as BaseIcon} from '@monokle/components';
import {Colors} from '@shared/styles/colors';

export const Heading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 16px;
  background-color: rgba(255, 255, 255, 0.05);
`;

export const HeadingLeft = styled.div`
  display: flex;
  align-items: center;
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
