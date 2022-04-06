import {useMemo} from 'react';

import {useAppSelector} from '@redux/hooks';
import {activeProjectSelector} from '@redux/selectors';

import featureJson from '@src/feature-flags.json';

import RecentProjectsPane from '../RecentProjectsPane';
import StartProjectPane from '../StartProjectPane';
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
    let gridTemplateColumns = 'max-content 1fr';

    if (featureJson.ShowRightMenu) {
      gridTemplateColumns += ' max-content';
    }

    return gridTemplateColumns;
  }, []);

  return (
    <S.PaneManagerContainer $gridTemplateColumns={gridColumns}>
      <PaneManagerLeftMenu />

      {isProjectLoading ? (
        <S.Skeleton />
      ) : activeProject && !isStartProjectPaneVisible ? (
        <PaneManagerSplitView />
      ) : (
        <S.GettingStartedContainer>
          <StartProjectPane />

          {Boolean(projects.length) && <RecentProjectsPane />}
        </S.GettingStartedContainer>
      )}

      {featureJson.ShowRightMenu && <PaneManagerRightMenu />}
    </S.PaneManagerContainer>
  );
};

export default PaneManager;
