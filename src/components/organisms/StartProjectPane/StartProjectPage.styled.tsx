import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const InformationMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  color: ${Colors.whitePure};
  font-weight: 600;
`;

export const StartProjectOptions = styled.div`
  display: grid;
  justify-content: center;
  grid-template-columns: repeat(3, 20rem);
  grid-template-rows: 15rem;
  grid-column-gap: 1.1rem;
  grid-row-gap: 1.1rem;
  padding: 0 6rem;
  align-items: center;
`;

export const StartProjectContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 60px;
  margin-top: -50px;
  height: 100%;
`;
