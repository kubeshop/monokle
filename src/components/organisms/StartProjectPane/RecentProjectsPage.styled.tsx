import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const ActionItems = styled.div`
  min-height: 150px;
  display: grid;
  grid-template-columns: repeat(3, 15rem);
  grid-column-gap: 1rem;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
`;

export const Actions = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ActionsTitle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 1.5rem;
  color: ${Colors.whitePure};
`;

export const Container = styled.div`
  display: grid;
  grid-template-rows: max-content 1fr 15rem;
  grid-row-gap: 10px;
  margin-bottom: 3rem;
`;

export const Projects = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
`;

export const ProjectsContainer = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  overflow-y: auto;
`;

export const ProjectsContainerWrapper = styled.div`
  position: relative;
  height: 100%;
  width: 30rem;
`;

export const ProjectsTitle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: ${Colors.whitePure};
  margin: 3rem 0 1rem 0;
  font-weight: 600;
`;
