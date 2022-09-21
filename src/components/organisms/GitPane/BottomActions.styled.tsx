import {Dropdown} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const BottomActionsContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  z-index: 100;
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
