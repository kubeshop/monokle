import {Button} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div<{$singleColumn?: boolean}>`
  display: flex;
  max-height: 600px;
  ${props => !props.$singleColumn && 'max-height: 600px;≈'}
  ${props =>
    props.$singleColumn &&
    `
    flex-direction: column-reverse;
    justify-content: flex-end;
  `}
  @media (max-width: 800px) {
    flex-direction: column-reverse;
    justify-content: flex-end;
  }
`;

export const Content = styled.div`
  flex-grow: 1;
`;

export const Title = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: ${Colors.yellow6};
`;

export const Illustration = styled.div<{$singleColumn?: boolean}>`
  display: flex;
  align-items: center;
  width: 700px;
  ${props =>
    props.$singleColumn &&
    `
    width: 350px;
    margin-top: 16px;
    margin-bottom: 40px;
  `}
`;

export const Image = styled.img`
  width: 100%;
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const ConfirmButton = styled(Button)`
  margin-left: 8px;
`;

export const ListItem = styled.li`
  padding: 2.5px 0;
`;
