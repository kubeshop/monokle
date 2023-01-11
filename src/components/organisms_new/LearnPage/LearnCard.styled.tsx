import {Button as RawButton} from 'antd';

import styled from 'styled-components';

import {IconButton} from '@components/atoms';

import {Colors} from '@shared/styles/colors';

export const Button = styled(RawButton)`
  border-radius: 2px;
  color: ${Colors.whitePure};
  width: max-content;
  margin-top: 6px;
`;

export const Description = styled.div`
  color: ${Colors.grey8};
`;

export const Icon = styled(IconButton)`
  width: 32px;
  height: 32px;
  color: ${Colors.geekblue7};
`;

export const LearnCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  border-radius: 4px;
  background-color: #202c4d;
  padding: 0px 20px;
`;

export const Title = styled.div`
  font-weight: 700;
  color: ${Colors.grey9};
`;
