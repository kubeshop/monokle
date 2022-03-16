import styled from 'styled-components';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import Colors from '@styles/Colors';

export const Container = styled.div<{$singleColumn?: boolean}>`
  display: flex;
  margin-bottom: 20px;
  max-height: 600px;
  overflow: auto;
  ${GlobalScrollbarStyle}
  min-height: min-content;

  ${props =>
    props.$singleColumn &&
    `
    height: 100%;
    max-height: 100%;
    flex-direction: column-reverse;
    justify-content: center;
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
