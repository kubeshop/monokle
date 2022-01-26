import React from 'react';

import {Row} from 'antd';

import {DateTime} from 'luxon';

import {Project} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setOpenProject} from '@redux/reducers/appConfig';
import {toggleStartProjectPane} from '@redux/reducers/ui';
import {activeProjectSelector} from '@redux/selectors';

import {MonoPaneTitle, MonoPaneTitleCol} from '@atoms';

import * as S from './Styled';

const RecentProjectsPane = () => {
  const dispatch = useAppDispatch();

  const projects: Project[] = useAppSelector(state => state.config.projects);
  const activeProject = useAppSelector(activeProjectSelector);

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
            <S.TitleBarContainer>
              <S.Title>Recent Projects</S.Title>
            </S.TitleBarContainer>
          </MonoPaneTitle>
        </MonoPaneTitleCol>
      </Row>
      <Row>
        <S.ProjectsContainer>
          {projects.map((project: Project) => {
            const isActivePropject = project.rootFolder === activeProject?.rootFolder;
            return (
              <S.ProjectItem key={project.rootFolder} activeproject={isActivePropject}>
                <S.ProjectName
                  onClick={() => (isActivePropject ? dispatch(toggleStartProjectPane()) : openProject(project))}
                >
                  {project.name}
                </S.ProjectName>
                <S.ProjectPath>{project.rootFolder}</S.ProjectPath>
                <S.ProjectLastOpened>
                  {getRelativeDate(project.lastOpened)
                    ? `last opened ${getRelativeDate(project.lastOpened)}`
                    : 'Not opened yet'}
                </S.ProjectLastOpened>
              </S.ProjectItem>
            );
          })}
        </S.ProjectsContainer>
      </Row>
    </>
  );
};

export default RecentProjectsPane;
