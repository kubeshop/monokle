import React, {useCallback, useMemo} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setPaneConfiguration, toggleLeftMenu} from '@redux/reducers/ui';
import {isInClusterModeSelector} from '@redux/selectors';

import {
  ActionsPane,
  BottomPaneManager,
  Dashboard,
  GitOpsView,
  NavigatorPane,
  RecentProjectsPage,
  StartProjectPage,
  TutorialPage,
} from '@organisms';
import {EmptyDashboard} from '@organisms/Dashboard/EmptyDashboard';

import {FeatureFlag} from '@utils/features';
import {useMainPaneDimensions} from '@utils/hooks';

import {ResizableColumnsPanel, ResizableRowsPanel} from '@monokle/components';
import {activeProjectSelector} from '@shared/utils/selectors';

import StartPage from '../StartPage';
import * as S from './PaneManager.styled';
import PaneManagerLeftMenu from './PaneManagerLeftMenu';
import {activities} from './activities';

const NewPaneManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isProjectLoading = useAppSelector(state => state.config.isProjectLoading);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const layout = useAppSelector(state => state.ui.paneConfiguration);
  const leftMenuActive = useAppSelector(state => state.ui.leftMenu.isActive);
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);
  const projects = useAppSelector(state => state.config.projects);
  const previewingCluster = useAppSelector(state => state.ui.previewingCluster);

  const {height, width} = useMainPaneDimensions();

  const gridColumns = useMemo(() => {
    if ((!activeProject && !previewingCluster) || isStartProjectPaneVisible) {
      return '1fr';
    }

    return 'max-content 1fr';
  }, [activeProject, isStartProjectPaneVisible, previewingCluster]);

  const topPaneFlex = useMemo(
    () => (bottomSelection ? 1 - layout.bottomPaneHeight / height : 1),
    [bottomSelection, height, layout.bottomPaneHeight]
  );

  const handleColumnResize = useCallback(
    (position: 'center' | 'right' | 'left', flex: number) => {
      if (position === 'center') {
        dispatch(setPaneConfiguration({navPane: flex}));
      } else if (position === 'left') {
        dispatch(setPaneConfiguration({leftPane: flex}));
      } else if (position === 'right') {
        dispatch(setPaneConfiguration({editPane: flex}));
      }
    },

    [dispatch]
  );

  const handleRowResize = useCallback(
    (position: 'top' | 'bottom', flex: number) => {
      if (position !== 'bottom') {
        return;
      }

      dispatch(setPaneConfiguration({bottomPaneHeight: flex * height}));
    },
    [dispatch, height]
  );

  const currentActivity = useMemo(() => activities.find(a => a.name === leftMenuSelection), [leftMenuSelection]);

  return (
    <S.PaneManagerContainer $gridTemplateColumns={gridColumns}>
      {isProjectLoading ? (
        <S.Skeleton />
      ) : (activeProject || previewingCluster) && !isStartProjectPaneVisible ? (
        <>
          <PaneManagerLeftMenu />

          <ResizableRowsPanel
            layout={{top: topPaneFlex, bottom: layout.bottomPaneHeight / height}}
            top={
              currentActivity?.type === 'fullscreen' ? (
                currentActivity.component
              ) : !isInClusterMode && currentActivity?.name === 'dashboard' ? (
                <EmptyDashboard />
              ) : (
                <ResizableColumnsPanel
                  left={leftMenuActive ? currentActivity?.component : undefined}
                  center={
                    !['git', 'validation', 'dashboard'].includes(currentActivity?.name ?? '') ? (
                      <NavigatorPane />
                    ) : (
                      <TutorialPage />
                    )
                  }
                  right={
                    currentActivity?.name === 'git' ? (
                      <GitOpsView />
                    ) : currentActivity?.name === 'dashboard' ? (
                      <Dashboard />
                    ) : (
                      <ActionsPane />
                    )
                  }
                  layout={{left: layout.leftPane, center: layout.navPane, right: layout.editPane}}
                  width={width}
                  onStopResize={handleColumnResize}
                  leftClosable
                  onCloseLeftPane={() => dispatch(toggleLeftMenu())}
                />
              )
            }
            bottom={<BottomPaneManager />}
            splitterStyle={{display: bottomSelection === 'terminal' ? 'block' : 'none'}}
            bottomElementStyle={{
              overflow: bottomSelection === 'terminal' ? 'hidden' : 'auto',
              display: bottomSelection === 'terminal' ? 'block' : 'none',
            }}
            onStopResize={handleRowResize}
            height={height}
            width={width}
          />
        </>
      ) : (
        <FeatureFlag
          name="NewStartPage"
          fallback={<>{projects.length > 0 ? <RecentProjectsPage /> : <StartProjectPage />}</>}
        >
          <StartPage />
        </FeatureFlag>
      )}
    </S.PaneManagerContainer>
  );
};

export default NewPaneManager;
