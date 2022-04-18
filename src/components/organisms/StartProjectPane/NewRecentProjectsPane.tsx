import {Button, Tooltip} from 'antd';

import {DateTime} from 'luxon';
import styled from 'styled-components';

import {Project} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setOpenProject} from '@redux/reducers/appConfig';
import {toggleStartProjectPane} from '@redux/reducers/ui';
import {activeProjectSelector} from '@redux/selectors';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import CreateFromTemplate from '@assets/CreateFromTemplate.svg';
import CreateScratch from '@assets/CreateScratch.svg';
import SelectFolder from '@assets/SelectFolder.svg';

import Colors from '@styles/Colors';

import Guide from './Guide';

import * as S from './styled';

const Container = styled.div`
  width: 100vw;
  height: calc(100vh - 47px);
  display: grid;
  grid-template-rows: 1.25rem calc(100vh - 47px - 16.25rem) 15rem;
`;

export const ProjectsContainer = styled.div`
  padding: 8px 12px;
  height: 100%;
  width: 30rem;
  overflow-y: auto;
  ${GlobalScrollbarStyle}
`;

export const Projects = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
`;

export const ActionItems = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
`;

export const ActionItem = styled.div`
  display: flex;
  width: 13rem;
  margin: 0 3rem;

  &:first-child {
    margin-left: 0;
  }
  &:last-child {
    margin-right: 0;
  }
`;

const ActionItemLogo = styled.img`
  width: 4.5rem;
  height: 4.5rem;
`;

const ActionItemContext = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 0 0 1rem;
  font-weight: 400;
  font-size: 13px;
`;

const Actions = styled.div`
  background: ${Colors.grey10};
  display: flex;
  flex-direction: column;
  padding: 2rem 0 1rem 0;
`;

const ActionsTitle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 1.5rem;
  color: ${Colors.whitePure};
`;

const ActionItemText = styled.div``;
const ActionItemButton = styled(Button)`
  display: flex;
  padding: 0;
  margin: 0;
  align-items: end;
`;

const NewRecentProjectsPane = () => {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(state => state.config.projects);
  const activeProject = useAppSelector(activeProjectSelector);

  const openProject = (project: Project) => {
    dispatch(setOpenProject(project.rootFolder));
  };

  const onProjectItemClick = (isActivePropject: boolean, project: Project) => {
    if (isActivePropject) {
      dispatch(toggleStartProjectPane());
      return;
    }
    openProject(project);
  };

  const getRelativeDate = (isoDate: string | undefined) => {
    if (isoDate) {
      return DateTime.fromISO(isoDate).toRelative();
    }
    return '';
  };

  return (
    <Container>
      <Guide />
      <Projects>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '24px',
            color: `${Colors.whitePure}`,
            margin: '3rem 0 1rem 0',
          }}
        >
          Recent Projects
        </div>
        <ProjectsContainer>
          {projects.map((project: Project) => {
            const isActivePropject = project.rootFolder === activeProject?.rootFolder;
            return (
              <S.ProjectItem
                key={project.rootFolder}
                activeproject={isActivePropject}
                onClick={() => onProjectItemClick(isActivePropject, project)}
              >
                <S.ProjectName>{project.name}</S.ProjectName>
                <Tooltip title={project.rootFolder} placement="bottom">
                  <S.ProjectPath>{project.rootFolder}</S.ProjectPath>
                </Tooltip>
                <S.ProjectLastOpened>
                  {getRelativeDate(project.lastOpened)
                    ? `last opened ${getRelativeDate(project.lastOpened)}`
                    : 'Not opened yet'}
                </S.ProjectLastOpened>
              </S.ProjectItem>
            );
          })}
        </ProjectsContainer>
      </Projects>
      <Actions>
        <ActionsTitle>Start a new one</ActionsTitle>
        <ActionItems>
          <ActionItem>
            <ActionItemLogo src={SelectFolder} />
            <ActionItemContext>
              <ActionItemText>Select a folder with k8s resource</ActionItemText>
              <ActionItemButton type="link">Open</ActionItemButton>
            </ActionItemContext>
          </ActionItem>
          <ActionItem>
            <ActionItemLogo src={CreateScratch} />
            <ActionItemContext>
              <ActionItemText>Create a project from scratch</ActionItemText>
              <ActionItemButton type="link">Create</ActionItemButton>
            </ActionItemContext>
          </ActionItem>
          <ActionItem>
            <ActionItemLogo src={CreateFromTemplate} />
            <ActionItemContext>
              <ActionItemText>Start from a template</ActionItemText>
              <ActionItemButton type="link">Select template</ActionItemButton>
            </ActionItemContext>
          </ActionItem>
        </ActionItems>
      </Actions>
    </Container>
  );
};

export default NewRecentProjectsPane;
