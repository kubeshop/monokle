import {Button as RawButton} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const AppContainer = styled.div`
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

export const MainContainer = styled.div`
  height: 100%;
  width: 100%;

  display: grid;
  grid-template-rows: max-content 1fr max-content;
`;

export const Button = styled(RawButton)`
  padding: 5px;
  color: ${Colors.blue6};
  border: none;

  &:hover {
    color: ${Colors.blue6};
    opacity: 0.8;
  }
`;
