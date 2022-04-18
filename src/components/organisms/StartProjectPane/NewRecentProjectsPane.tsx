import {Tooltip} from 'antd';

import {DateTime} from 'luxon';
import styled from 'styled-components';

import {Project} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setOpenProject} from '@redux/reducers/appConfig';
import {toggleStartProjectPane} from '@redux/reducers/ui';
import {activeProjectSelector} from '@redux/selectors';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import Colors from '@styles/Colors';

import Guide from './Guide';

import * as S from './styled';

const Container = styled.div`
  width: 100vw;
  height: calc(100vh - 47px);
  display: grid;
  grid-template-rows: 20px calc(100vh - 307px) 240px;
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
      <div style={{background: '#242C2F'}}>footer</div>
    </Container>
  );
};

export default NewRecentProjectsPane;
