import React, {useCallback, useEffect, useMemo} from 'react';

import {Skeleton} from 'antd';

import {activeProjectSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setPaneConfiguration, toggleLeftMenu} from '@redux/reducers/ui';

import {ActionsPane, BottomPaneManager, Dashboard, GitOpsView, NavigatorPane} from '@organisms';
import {EmptyDashboard} from '@organisms/Dashboard/EmptyDashboard';

import {ClosedPanePlaceholder} from '@molecules';

import {useMainPaneDimensions} from '@utils/hooks';

import {ResizableColumnsPanel, ResizableRowsPanel} from '@monokle/components';
import {isInClusterModeSelector} from '@shared/utils/selectors';

import ProblemPane from '../ProblemPane';
import StartPage from '../StartPage';
import * as S from './PaneManager.styled';
import PaneManagerLeftMenu from './PaneManagerLeftMenu';
import {activities} from './activities';

const PaneManager: React.FC = () => {
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

  const currentActivity = useMemo(() => activities.find(a => a.name === leftMenuSelection), [leftMenuSelection]);

  const showClosedPanePlaceholder = useMemo(
    () => !leftMenuActive && ['explorer', 'dashboard'].includes(currentActivity?.name || ''),
    [currentActivity?.name, leftMenuActive]
  );

  const gridColumns = useMemo(() => {
    if ((!activeProject && !isInQuickClusterMode) || isStartProjectPaneVisible) {
      return '1fr';
    }

    if (showClosedPanePlaceholder) {
      return 'max-content 12px 1fr';
    }

    return 'max-content 1fr';
  }, [activeProject, isInQuickClusterMode, isStartProjectPaneVisible, showClosedPanePlaceholder]);

  const handleColumnResize = useCallback(
    (sizes: number[]) => {
      const [left, center, right] = sizes;

      let leftPane = left / width;
      let navPane = center / width;
      let editPane = right / width;

      if (currentActivity?.name !== 'explorer') {
        leftPane = left / width;
        editPane = center / width;
        dispatch(setPaneConfiguration({leftPane, editPane}));
        return;
      }

      // if left pane is closed, only update center and right
      if (!right) {
        navPane = left / width;
        editPane = center / width;
        dispatch(setPaneConfiguration({navPane, editPane}));
      } else {
        dispatch(setPaneConfiguration({leftPane, navPane, editPane}));
      }
    },

    [currentActivity?.name, dispatch, width]
  );

  const columnsSizes = useMemo(() => {
    const editPane = layout.editPane === 0 ? 1 - layout.leftPane - layout.navPane : layout.editPane;

    const leftPaneWidth = layout.leftPane * width;
    const navPaneWidth = layout.navPane * width;
    const editPaneWidth = editPane * width;

    if (leftPaneWidth + navPaneWidth + editPaneWidth > width) {
      return [leftPaneWidth, 350, 1 - leftPaneWidth - 350];
    }

    if (currentActivity?.name === 'explorer') {
      return [leftPaneWidth, navPaneWidth, editPaneWidth];
    }

    return [leftPaneWidth, 0, width - leftPaneWidth];
  }, [currentActivity?.name, layout.editPane, layout.leftPane, layout.navPane, width]);

  const rowsSizes = useMemo(() => {
    return [height - layout.bottomPaneHeight, layout.bottomPaneHeight];
  }, [height, layout.bottomPaneHeight]);

  const handleRowResize = useCallback(
    (sizes: number[]) => {
      dispatch(setPaneConfiguration({bottomPaneHeight: sizes[1]}));
    },
    [dispatch]
  );

  useEffect(() => {
    const editPane = layout.editPane === 0 ? 1 - layout.leftPane - layout.navPane : layout.editPane;

    const leftPaneWidth = layout.leftPane * width;
    const navPaneWidth = layout.navPane * width;
    const editPaneWidth = editPane * width;

    if (leftPaneWidth + navPaneWidth + editPaneWidth > width) {
      handleColumnResize([leftPaneWidth, 350, 1 - leftPaneWidth - 350]);
    }
  }, [handleColumnResize, layout.editPane, layout.leftPane, layout.navPane, width]);

  return (
    <S.PaneManagerContainer $gridTemplateColumns={gridColumns}>
      {isProjectLoading ? (
        <S.Skeleton active />
      ) : (activeProject || isInQuickClusterMode) && !isStartProjectPaneVisible ? (
        <>
          <PaneManagerLeftMenu />

          {showClosedPanePlaceholder && <ClosedPanePlaceholder />}

          <ResizableRowsPanel
            defaultSizes={rowsSizes}
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
                  isLeftActive={leftMenuActive}
                  paneCloseIconStyle={{top: '20px', right: '-8px'}}
                  left={
                    !['explorer', 'dashboard'].includes(currentActivity?.name || '') ||
                    (leftMenuActive && ['explorer', 'dashboard'].includes(currentActivity?.name || ''))
                      ? currentActivity?.component
                      : undefined
                  }
                  center={currentActivity?.name === 'explorer' ? <NavigatorPane /> : undefined}
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
                  leftClosable={['explorer', 'dashboard'].includes(currentActivity?.name || '')}
                  onCloseLeftPane={() => dispatch(toggleLeftMenu())}
                  defaultSizes={columnsSizes}
                  onDragEnd={handleColumnResize}
                />
              )
            }
            bottom={<BottomPaneManager />}
            isBottomVisible={Boolean(bottomSelection)}
            onDragEnd={handleRowResize}
          />
        </>
      ) : (
        <StartPage />
      )}
    </S.PaneManagerContainer>
  );
};

export default PaneManager;
