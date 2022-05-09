import {Button as RawButton} from 'antd';

import styled from 'styled-components';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

export const Button = styled(RawButton)`
  padding: 0 20px;
`;

export const NotificationMarkdownContainer = styled.div`
  & p {
    display: inline;
  }
`;

export const NotificationModalContent = styled.div`
  max-height: 450px;
  overflow-y: auto;
  padding-right: 10px;

  ${GlobalScrollbarStyle};
`;

export const SeeAllButton = styled(RawButton)`
  border: none;
  padding: 0;
  font-size: 12px;
  margin-left: 6px;
  height: auto;
`;
