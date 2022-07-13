import {Button} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const ActionItem = styled.div`
  display: flex;
`;

export const ActionItemButton = styled(Button)`
  display: flex;
  padding: 0;
  margin: 0;
  align-items: end;
  font-size: 13px;
`;

export const ActionItemContext = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 0 0 1rem;
  font-weight: 400;
  font-size: 13px;
`;

export const ActionItemLogo = styled.img`
  width: 4.5rem;
  height: 4.5rem;
`;

export const ActionItemText = styled.div``;

export const ActionItems = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 13rem);
  grid-column-gap: 3rem;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
`;

export const Actions = styled.div`
  background: ${Colors.grey3000};
  display: flex;
  flex-direction: column;
  padding: 2rem 0 1rem 0;
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
