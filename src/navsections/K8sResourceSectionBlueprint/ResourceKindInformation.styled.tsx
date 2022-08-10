import {Tag as RawTag} from 'antd';

import {InfoCircleOutlined as RawInfoCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const InfoCircleOutlined = styled(RawInfoCircleOutlined)<{$isSelected: boolean}>`
  color: ${props => (props.$isSelected ? Colors.blackPure : Colors.blue9)};
  padding: 0 5px;
`;

export const InfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${Colors.grey9};
`;

export const Tag = styled(RawTag)`
  color: ${Colors.yellow8};
  background: rgba(252, 255, 130, 0.15);
  border-radius: 4px;
  margin: 0;
`;
