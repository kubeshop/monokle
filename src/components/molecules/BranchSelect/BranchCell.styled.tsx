import {
  BranchesOutlined as RawBranchesOutlined,
  CloudOutlined as RawCloudOutlined,
  DeleteOutlined as RawDeleteOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Box = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
`;

export const BranchInfo = styled.div`
  display: flex;
  gap: 10px;
`;

export const BranchesOutlined = styled(RawBranchesOutlined)`
  padding-top: 6px;
  font-size: 16px;
`;

export const BranchUpdated = styled.span`
  display: flex;
  height: 16px;
  font-size: 12px;
  font-weight: 400;
  color: ${Colors.grey7};
`;

export const CloudOutlined = styled(RawCloudOutlined)`
  padding-top: 5px;
  font-size: 16px;
`;

export const CommitShaLabel = styled.span`
  color: ${Colors.grey7};
`;

export const DeleteOutlined = styled(RawDeleteOutlined)`
  color: ${Colors.red7};
  display: none;
  margin-right: 8px;
`;

export const NameLabel = styled.div`
  max-width: 375px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: ${Colors.grey9};
`;
