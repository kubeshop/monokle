import {useCallback, useMemo} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setPaneConfiguration} from '@redux/reducers/ui';
import {activeProjectSelector} from '@redux/selectors';

import {useMainPaneDimensions} from '@utils/hooks';

import BottomPaneManager from '../BottomPaneManager';
import {RecentProjectsPage, StartProjectPage} from '../StartProjectPane';
import PaneManagerLeftMenu from './PaneManagerLeftMenu';
import PaneManagerSplitView from './PaneManagerSplitView';
// eslint-disable-next-line import/no-relative-packages
import {ReflexContainer, ReflexElement, ReflexSplitter} from './react-reflex';

import * as S from './styled';

const PaneManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const isProjectLoading = useAppSelector(state => state.config.isProjectLoading);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const layout = useAppSelector(state => state.ui.paneConfiguration);
  const projects = useAppSelector(state => state.config.projects);

  const {height, width} = useMainPaneDimensions();

  const gridColumns = useMemo(() => {
    if (!activeProject || isStartProjectPaneVisible) {
      return '1fr';
    }

    return 'max-content 1fr';
  }, [activeProject, isStartProjectPaneVisible]);

  const handleBottomPaneResize = useCallback(
    (elements: any) => {
      const bottomPaneElement = elements.find((el: any) => el.props.id === 'bottomPane');

      if (!bottomPaneElement) {
        return;
      }

      dispatch(setPaneConfiguration({...layout, bottomPaneHeight: bottomPaneElement.props.flex * height}));
    },
    [dispatch, height, layout]
  );

  const topPaneFlex = useMemo(() => (bottomSelection ? undefined : 1), [bottomSelection]);

  return (
    <S.PaneManagerContainer $gridTemplateColumns={gridColumns}>
      {isProjectLoading ? (
        <S.Skeleton />
      ) : activeProject && !isStartProjectPaneVisible ? (
        <>
          <PaneManagerLeftMenu />

          <ReflexContainer
            windowResizeAware
            style={{height: height + 1, width, position: 'relative'}}
            onStopResize={handleBottomPaneResize}
          >
            <ReflexElement id="topPane" flex={topPaneFlex}>
              <PaneManagerSplitView />
            </ReflexElement>

            <ReflexSplitter style={{display: bottomSelection === 'terminal' ? 'block' : 'none'}} />

            <ReflexElement
              id="bottomPane"
              minSize={150}
              maxSize={450}
              flex={layout.bottomPaneHeight / height}
              style={{
                overflow: bottomSelection === 'terminal' ? 'hidden' : 'auto',
                display: bottomSelection === 'terminal' ? 'block' : 'none',
              }}
            >
              <BottomPaneManager />
            </ReflexElement>
          </ReflexContainer>
        </>
      ) : projects.length > 0 ? (
        <RecentProjectsPage />
      ) : (
        <StartProjectPage />
      )}
    </S.PaneManagerContainer>
  );
};

export default PaneManager;
