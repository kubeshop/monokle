import {LegacyRef, useCallback, useMemo} from 'react';
import {ResizableBox} from 'react-resizable';
import {useMeasure, useWindowSize} from 'react-use';

import {Tooltip} from 'antd';

import {DateTime} from 'luxon';
import Nucleus from 'nucleus-nodejs';

import {Project} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setOpenProject} from '@redux/reducers/appConfig';
import {setPaneConfiguration, toggleStartProjectPane} from '@redux/reducers/ui';
import {activeProjectSelector} from '@redux/selectors';

import {TitleBar} from '@molecules';

import * as S from './styled';

const RecentProjectsPane = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const paneConfiguration = useAppSelector(state => state.ui.paneConfiguration);
  const projects = useAppSelector(state => state.config.projects);

  const size = useWindowSize();

  const recentProjectsPaneMaxWidth = useMemo(() => {
    return 0.5 * size.width;
  }, [size.width]);

  const [recentProjectsPaneRef, {height: recentProjectsPaneHeight, width: recentProjectsPaneWidth}] =
    useMeasure<HTMLDivElement>();

  const openProject = (project: Project) => {
    Nucleus.track('OPEN_PROJECT', {from: 'RECENT_PROJECTS'});
    Nucleus.trackError('TEST_ERROR', new Error('Test purposes'));
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

  const resizePane = useCallback(() => {
    if (recentProjectsPaneWidth !== paneConfiguration.recentProjectsPaneWidth) {
      dispatch(setPaneConfiguration({...paneConfiguration, recentProjectsPaneWidth}));
    }
  }, [dispatch, paneConfiguration, recentProjectsPaneWidth]);

  return (
    <S.RecentProjectsPaneContainer ref={recentProjectsPaneRef}>
      <ResizableBox
        width={paneConfiguration.recentProjectsPaneWidth || 450}
        height={recentProjectsPaneHeight}
        minConstraints={[350, recentProjectsPaneHeight]}
        maxConstraints={[recentProjectsPaneMaxWidth, recentProjectsPaneHeight]}
        axis="x"
        resizeHandles={['w']}
        handle={(h: number, ref: LegacyRef<HTMLSpanElement>) => <span className="custom-modal-handle" ref={ref} />}
        onResizeStop={resizePane}
      >
        <S.Container>
          <TitleBar title="Recent Projects" />

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
