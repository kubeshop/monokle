import React, {useCallback, useMemo} from 'react';

import {Skeleton} from 'antd';

import {activeProjectSelector, isInClusterModeSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setPaneConfiguration, toggleLeftMenu} from '@redux/reducers/ui';

import {ActionsPane, BottomPaneManager, Dashboard, GitOpsView, NavigatorPane} from '@organisms';
import {EmptyDashboard} from '@organisms/Dashboard/EmptyDashboard';

import {useMainPaneDimensions} from '@utils/hooks';

import {ResizableColumnsPanel, ResizableRowsPanel} from '@monokle/components';

import ProblemPane from '../ProblemPane';
import StartPage from '../StartPage';
import * as S from './PaneManager.styled';
import PaneManagerLeftMenu from './PaneManagerLeftMenu';
import {activities} from './activities';

const NewPaneManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isPreviewLoading = useAppSelector(state => state.main.previewOptions.isLoading);
  const isProjectLoading = useAppSelector(state => state.config.isProjectLoading);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const layout = useAppSelector(state => state.ui.paneConfiguration);
  const leftMenuActive = useAppSelector(state => state.ui.leftMenu.isActive);
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);
  const isInQuickClusterMode = useAppSelector(state => state.ui.isInQuickClusterMode);

  const {height, width} = useMainPaneDimensions();

  const gridColumns = useMemo(() => {
    if ((!activeProject && !isInQuickClusterMode) || isStartProjectPaneVisible) {
      return '1fr';
    }

    return 'max-content 1fr';
  }, [activeProject, isStartProjectPaneVisible, isInQuickClusterMode]);

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
      ) : (
        <>
          {(activeProject || isInQuickClusterMode) && !isStartProjectPaneVisible && <PaneManagerLeftMenu />}

          {!isStartProjectPaneVisible ? (
            <ResizableRowsPanel
              layout={{top: topPaneFlex, bottom: layout.bottomPaneHeight / height}}
              top={
                currentActivity?.type === 'fullscreen' ? (
                  currentActivity.component
                ) : !isInClusterMode && currentActivity?.name === 'dashboard' ? (
                  isPreviewLoading ? (
                    <Skeleton active style={{margin: 20}} />
                  ) : (
                    <EmptyDashboard />
                  )
                ) : (
                  <ResizableColumnsPanel
                    paneCloseIconStyle={{top: 15}}
                    left={leftMenuActive ? currentActivity?.component : undefined}
                    center={
                      !['git', 'validation', 'dashboard'].includes(currentActivity?.name ?? '') ? (
                        <NavigatorPane />
                      ) : null
                    }
                    right={
                      currentActivity?.name === 'git' ? (
                        <GitOpsView />
                      ) : currentActivity?.name === 'dashboard' ? (
                        <Dashboard />
                      ) : currentActivity?.name === 'validation' ? (
                        <ProblemPane />
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
          ) : (
            <StartPage />
          )}
        </>
      )}
    </S.PaneManagerContainer>
  );
};

export default NewPaneManager;
