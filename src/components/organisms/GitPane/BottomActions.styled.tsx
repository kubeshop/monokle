import {Dropdown, Button as RawButton} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const BottomActionsContainer = styled.div`
  height: 60px;
  background-color: ${Colors.grey1};
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 14px;
  align-items: center;
  padding: 0px 14px;
  width: 100%;
  overflow-x: hidden;
  flex-shrink: 0;
`;

export const CommitButton = styled(RawButton)`
  width: 100%;
`;

export const PublishBranchButton = styled(Dropdown.Button)`
  & button:first-child {
    width: 100%;
  }
`;

export const PushPullContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  margin-right: 4px;
`;

export const SyncButton = styled(Dropdown.Button)`
  & button:first-child {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

export const SyncButtonLabel = styled.span`
  margin-right: 10px;
`;
