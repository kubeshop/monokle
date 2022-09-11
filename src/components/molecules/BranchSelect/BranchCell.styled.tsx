import {BranchesOutlined as RawBranchesOutlined, CloudOutlined as RawCloudOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Box = styled.div`
  display: flex;
  gap: 10px;
  cursor: pointer;
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

export const NameLabel = styled.div`
  max-width: 375px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: ${Colors.grey9};
`;
