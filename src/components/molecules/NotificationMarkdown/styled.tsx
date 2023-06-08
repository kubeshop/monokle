import {Button as RawButton} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Button = styled(RawButton)`
  padding: 0 20px;
`;

export const Content = styled.div`
  margin-top: 10px;
`;

export const NotificationMarkdownContainer = styled.div`
  & pre {
    display: inline;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
`;

export const NotificationModalContent = styled.div`
  max-height: 450px;
  overflow-y: auto;
  padding-right: 10px;
`;

export const SeeAllButton = styled(RawButton)`
  border: none;
  padding: 0;
  font-size: 12px;
  margin-left: 6px;
  height: auto;
`;

export const CancelButton = styled.button`
  border: 1px solid ${Colors.blue6};
  color: ${Colors.grey100};
  padding: 0 20px;
  height: 32px;
`;

export const DefaultActionButton = styled.button`
  border: none;
  background-color: ${Colors.blue6};
  padding: 0 20px;
  height: 32px;
  margin-left: 10px;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  align-items: center;
`;
