import {LegacyRef, useCallback, useMemo} from 'react';
import {ResizableBox} from 'react-resizable';
import {useMeasure, useWindowSize} from 'react-use';

import {DateTime} from 'luxon';

import {Project} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setOpenProject} from '@redux/reducers/appConfig';
import {setPaneConfiguration, toggleStartProjectPane} from '@redux/reducers/ui';
import {activeProjectSelector} from '@redux/selectors';

import {TitleBar} from '@molecules';

import {ProjectsContainer} from './NewRecentProjectsPane';
import RecentProject from './RecentProject';

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

          <ProjectsContainer>
            {projects.map((project: Project) => {
              const isActiveProject = project.rootFolder === activeProject?.rootFolder;
              return (
                <RecentProject project={project} isActive={isActiveProject} onProjectItemClick={onProjectItemClick} />
              );
            })}
          </ProjectsContainer>
        </S.Container>
      </ResizableBox>
    </S.RecentProjectsPaneContainer>
  );
};

export default RecentProjectsPane;
