import React from 'react';

import {Row} from 'antd';

import {DateTime} from 'luxon';
import styled from 'styled-components';

import {Project} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setOpenProject} from '@redux/reducers/appConfig';

import {MonoPaneTitle, MonoPaneTitleCol} from '@atoms';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import Colors from '@styles/Colors';

const TitleBarContainer = styled.div`
  display: flex;
  height: 24px;
  justify-content: space-between;
`;

const Title = styled.span`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding-right: 10px;
`;

const ProjectsContainer = styled.div`
  padding: 16px 12px;
  height: calc(100vh - 112px);
  overflow-y: scroll;
  width: 100%;
  ${GlobalScrollbarStyle}
`;

const ProjectItem = styled.div`
  margin-bottom: 16px;
`;

const ProjectName = styled.div`
  color: ${Colors.whitePure};
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: auto;

  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

const ProjectPath = styled.div`
  color: ${Colors.grey7};
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: auto;
`;

const ProjectLastOpened = styled.div`
  color: ${Colors.grey5};
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: auto;
`;

const RecentProjectsPane = () => {
  const dispatch = useAppDispatch();

  const projects: Project[] = useAppSelector(state => state.config.projects);

  const openProject = (project: Project) => {
    dispatch(setOpenProject(project.rootFolder));
  };

  const getRelativeDate = (isoDate: string | undefined) => {
    if (isoDate) {
      return DateTime.fromISO(isoDate).toRelative();
    }
    return '';
  };
  return (
    <>
      <Row>
        <MonoPaneTitleCol>
          <MonoPaneTitle>
            <TitleBarContainer>
              <Title>Recent Projects</Title>
            </TitleBarContainer>
          </MonoPaneTitle>
        </MonoPaneTitleCol>
      </Row>
      <Row>
        <ProjectsContainer>
          {projects.map((project: Project) => (
            <ProjectItem key={project.rootFolder}>
              <ProjectName onClick={() => openProject(project)}>{project.name}</ProjectName>
              <ProjectPath>{project.rootFolder}</ProjectPath>
              <ProjectLastOpened>
                {getRelativeDate(project.lastOpened)
                  ? `last opened ${getRelativeDate(project.lastOpened)}`
                  : 'Not opened yet'}
              </ProjectLastOpened>
            </ProjectItem>
          ))}
        </ProjectsContainer>
      </Row>
    </>
  );
};

export default RecentProjectsPane;
