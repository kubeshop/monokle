import {ipcRenderer} from 'electron';

import {useCallback, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import 'antd/dist/antd.less';

import styled from 'styled-components';

import {Project} from '@models/appconfig';
import {Size} from '@models/window';

import {useAppSelector} from '@redux/hooks';
import {setOpenProject} from '@redux/reducers/appConfig';

import {
  DiffModal,
  HotKeysHandler,
  MessageBox,
  NewResourceWizard,
  NotificationsDrawer,
  PageFooter,
  PageHeader,
  PaneManager,
  RenameResourceModal,
  SettingsDrawer,
  StartupModal,
} from '@organisms';

import {ClusterDiffModal} from '@components/organisms';
import CreateFolderModal from '@components/organisms/CreateFolderModal';
import CreateProjectModal from '@components/organisms/CreateProjectModal';
import QuickSearchActions from '@components/organisms/QuickSearchActions';
import RenameEntityModal from '@components/organisms/RenameEntityModal';
import UpdateModal from '@components/organisms/UpdateModal';

import {getFileStats} from '@utils/files';
import {useWindowSize} from '@utils/hooks';

import AppContext from './AppContext';

const AppContainer = styled.div<{$height: number; $width: number}>`
  ${props => (props.$height ? `height: ${props.$height}px;` : `height: 100%;`)}
  ${props => (props.$width ? `width: ${props.$width}px;` : `width: 100%;`)}
  overflow: hidden;
`;

const MainContainer = styled.div`
  height: 100%;
  width: 100%;
`;

const App = () => {
  const size: Size = useWindowSize();
  const dispatch = useDispatch();
  const loadLastProjectOnStartup = useAppSelector(state => state.config.settings.loadLastProjectOnStartup);
  const projects: Project[] = useAppSelector(state => state.config.projects);

  const onExecutedFrom = useCallback(
    (_, data) => {
      const project: Project = data.path || (loadLastProjectOnStartup && projects.length > 0 ? projects[0] : undefined);
      if (project && getFileStats(project.rootFolder)?.isDirectory()) {
        dispatch(setOpenProject(project.rootFolder));
      }
    },
    [loadLastProjectOnStartup, projects]
  );

  useEffect(() => {
    ipcRenderer.on('executed-from', onExecutedFrom);
    return () => {
      ipcRenderer.removeListener('executed-from', onExecutedFrom);
    };
  }, [onExecutedFrom]);

  return (
    <AppContext.Provider value={{windowSize: size}}>
      <AppContainer $height={size.height} $width={size.width}>
        <MessageBox />
        <MainContainer>
          <PageHeader />
          <SettingsDrawer />
          <NotificationsDrawer />
          <PaneManager />
          <PageFooter />
        </MainContainer>
        <DiffModal />
        <StartupModal />
        <NewResourceWizard />
        <QuickSearchActions />
        <HotKeysHandler />
        <RenameResourceModal />
        <UpdateModal />
        <ClusterDiffModal />
        <RenameEntityModal />
        <CreateFolderModal />
        <CreateProjectModal />
      </AppContainer>
    </AppContext.Provider>
  );
};

export default App;
