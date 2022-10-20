import {Button as RawButton} from 'antd';

import styled from 'styled-components';

html{
 font-size : 10px;
}

export const Button = styled(RawButton)`
  padding: 0 20px;
`;

export const Content = styled.div`
  margin-top: 10px;
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
`;

export const SeeAllButton = styled(RawButton)`
  border: none;
  padding: 0;
  font-size: 1.2rem;
  margin-left: 6px;
  height: auto;
`;
