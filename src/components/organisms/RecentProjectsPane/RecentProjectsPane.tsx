import React from 'react';

import {Row} from 'antd';

import _ from 'lodash';
import {DateTime} from 'luxon';
import styled from 'styled-components';

import {Project} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setOpenProject} from '@redux/reducers/appConfig';

import {MonoPaneTitle, MonoPaneTitleCol} from '@atoms';

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
    <div>
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
          {_.sortBy(projects, (p: Project) => p.lastOpened)
            .reverse()
            .map((project: Project) => (
              <ProjectItem key={project.rootFolder}>
                <ProjectName onClick={() => openProject(project)}>{project.name}</ProjectName>
                <ProjectPath>{project.rootFolder}</ProjectPath>
                <ProjectLastOpened>last opened {getRelativeDate(project.lastOpened)}</ProjectLastOpened>
              </ProjectItem>
            ))}
        </ProjectsContainer>
      </Row>
    </div>
  );
};

export default RecentProjectsPane;
