import * as k8s from '@kubernetes/client-node';

import {ipcRenderer} from 'electron';

import {useCallback, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {useDebounce} from 'react-use';

import 'antd/dist/antd.less';

import styled from 'styled-components';

import {DEFAULT_KUBECONFIG_DEBOUNCE, ROOT_FILE_ENTRY} from '@constants/constants';

import {Project, ProjectConfig} from '@models/appconfig';
import {Size} from '@models/window';

import {useAppSelector} from '@redux/hooks';
import {setOpenProject, updateProjectConfig} from '@redux/reducers/appConfig';
import {kubeConfigContextSelector, kubeConfigPathSelector, settingsSelector} from '@redux/selectors';
import {loadContexts} from '@redux/thunks/loadKubeConfig';

import {
  ClusterDiffModal,
  ClusterResourceDiffModal,
  CreateFolderModal,
  HotKeysHandler,
  LocalResourceDiffModal,
  MessageBox,
  NewResourceWizard,
  NotificationsDrawer,
  PageFooter,
  PageHeader,
  PaneManager,
  QuickSearchActions,
  RenameEntityModal,
  RenameResourceModal,
  SettingsDrawer,
  StartupModal,
  UpdateModal,
} from '@organisms';

import ChangeFiltersConfirmModal from '@components/molecules/ChangeFiltersConfirmModal/ChangeFiltersConfirmModal';
import SaveResourceToFileFolderModal from '@components/molecules/SaveResourcesToFileFolderModal';
import CreateProjectModal from '@components/organisms/CreateProjectModal';

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
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const {loadLastProjectOnStartup} = useAppSelector(settingsSelector);
  const projects: Project[] = useAppSelector(state => state.config.projects);
  const projectConfig: ProjectConfig | null | undefined = useAppSelector(state => state.config.projectConfig);
  const rootFile = useAppSelector(state => state.main.fileMap[ROOT_FILE_ENTRY]);

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

  useDebounce(
    () => {
      if (kubeConfigPath) {
        try {
          const kc = new k8s.KubeConfig();

          kc.loadFromFile(kubeConfigPath);
          dispatch(
            updateProjectConfig({
              ...projectConfig,
              kubeConfig: {
                ...projectConfig?.kubeConfig,
                isPathValid: Boolean(kc.contexts) || false,
              },
            })
          );
          loadContexts(kubeConfigPath, dispatch, kubeConfigContext);
        } catch (err) {
          dispatch(
            updateProjectConfig({
              ...projectConfig,
              kubeConfig: {...projectConfig?.kubeConfig, isPathValid: false},
            })
          );
        }
      }
    },
    DEFAULT_KUBECONFIG_DEBOUNCE,
    [kubeConfigPath, dispatch, kubeConfigContext, rootFile]
  );

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
        <LocalResourceDiffModal />
        <ClusterResourceDiffModal />
        <StartupModal />
        <NewResourceWizard />
        <QuickSearchActions />
        <HotKeysHandler />
        <RenameResourceModal />
        <SaveResourceToFileFolderModal />
        <ChangeFiltersConfirmModal />
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
