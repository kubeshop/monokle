import {useMemo} from 'react';

import {useAppSelector} from '@redux/hooks';
import {activeProjectSelector} from '@redux/selectors';

import featureJson from '@src/feature-flags.json';

import {RecentProjectsPage, StartProjectPage} from '../StartProjectPane';
import PaneManagerLeftMenu from './PaneManagerLeftMenu';
import PaneManagerRightMenu from './PaneManagerRightMenu';
import PaneManagerSplitView from './PaneManagerSplitView';

import * as S from './styled';

const PaneManager: React.FC = () => {
  const activeProject = useAppSelector(activeProjectSelector);
  const isProjectLoading = useAppSelector(state => state.config.isProjectLoading);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const projects = useAppSelector(state => state.config.projects);

  const gridColumns = useMemo(() => {
    if (!activeProject || isStartProjectPaneVisible) {
      return '1fr';
    }

    let gridTemplateColumns = 'max-content 1fr';

    if (featureJson.ShowRightMenu) {
      gridTemplateColumns += ' max-content';
    }

    return gridTemplateColumns;
  }, [activeProject, isStartProjectPaneVisible]);

  return (
    <S.PaneManagerContainer $gridTemplateColumns={gridColumns}>
      {isProjectLoading ? (
        <S.Skeleton />
      ) : activeProject && !isStartProjectPaneVisible ? (
        <>
          <PaneManagerLeftMenu />
          <PaneManagerSplitView />
        </>
      ) : projects.length > 0 ? (
        <RecentProjectsPage />
      ) : (
        <StartProjectPage />
      )}

      {featureJson.ShowRightMenu && <PaneManagerRightMenu />}
    </S.PaneManagerContainer>
  );
};

export default PaneManager;
