import {LegacyRef} from 'react';
import {ResizableBox} from 'react-resizable';
import {useMeasure} from 'react-use';

import {Tooltip} from 'antd';

import {DateTime} from 'luxon';

import {Project} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setOpenProject} from '@redux/reducers/appConfig';
import {toggleStartProjectPane} from '@redux/reducers/ui';
import {activeProjectSelector} from '@redux/selectors';

import {MonoPaneTitle} from '@atoms';

import * as S from './styled';

const RecentProjectsPane = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const projects = useAppSelector(state => state.config.projects);

  const [recentProjectsPaneRef, {height: recentProjectsPaneHeight, width: recentProjectsPaneWidth}] =
    useMeasure<HTMLDivElement>();

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
    <S.RecentProjectsPaneContainer ref={recentProjectsPaneRef}>
      <ResizableBox
        width={recentProjectsPaneWidth || 450}
        height={recentProjectsPaneHeight}
        minConstraints={[350, recentProjectsPaneHeight]}
        maxConstraints={[1000, recentProjectsPaneHeight]}
        axis="x"
        resizeHandles={['w']}
        handle={(h: number, ref: LegacyRef<HTMLSpanElement>) => <span className="custom-modal-handle" ref={ref} />}
      >
        <S.Container>
          <S.TitleBarContainer>
            <MonoPaneTitle>
              <S.Title>Recent Projects</S.Title>
            </MonoPaneTitle>
          </S.TitleBarContainer>

          <S.ProjectsContainer>
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
          </S.ProjectsContainer>
        </S.Container>
      </ResizableBox>
    </S.RecentProjectsPaneContainer>
  );
};

export default RecentProjectsPane;
