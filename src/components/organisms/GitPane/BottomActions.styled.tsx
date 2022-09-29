import {Dropdown, Button as RawButton} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

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
`;

export const CommitButton = styled(RawButton)<{$width: number}>`
  & span {
    width: ${({$width}) => `${$width}px` || '100%'};
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`;

export const PublishBranchButton = styled(Dropdown.Button)`
  & button:first-child {
    width: 100%;
  }
`;

export const PushButton = styled(RawButton)`
  width: 100%;
`;
