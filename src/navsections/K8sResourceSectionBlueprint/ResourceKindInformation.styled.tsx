import {Tag as RawTag} from 'antd';

import {InfoCircleFilled as RawInfoCircleFilled} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const InfoCircleFilled = styled(RawInfoCircleFilled)<{$isSelected: boolean}>`
  color: ${props => (props.$isSelected ? Colors.blackPure : Colors.blue9)};
  padding: 0 5px;
`;

export const InfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${Colors.grey9};
`;

export const Tag = styled(RawTag)<{$status?: 'Active' | 'Running' | 'Closed'}>`
  color: ${Colors.yellow8};
  background: rgba(252, 255, 130, 0.15);
  border-radius: 4px;
  margin: 0;

  ${({$status}) => {
    if ($status === 'Closed') {
      return `
        color: ${Colors.grey8};
        background: rgba(172, 172, 172, 0.15);
      `;
    }

    if ($status === 'Active') {
      return `
        color: ${Colors.green7};
        background: rgba(142, 212, 96, 0.15);
      `;
    }
  }}
`;
