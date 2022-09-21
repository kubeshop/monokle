import {Dropdown} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const BottomActionsContainer = styled.div`
  height: 50px;
  background-color: ${Colors.grey1};
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 14px;
  align-items: center;
  padding: 0px 14px;
`;

export const PublishBranchButton = styled(Dropdown.Button)`
  & button:first-child {
    width: 100%;
  }
`;
