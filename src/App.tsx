import * as k8s from '@kubernetes/client-node';

import {ipcRenderer} from 'electron';

import {useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useDebounce} from 'react-use';

import 'antd/dist/antd.less';

import styled from 'styled-components';

import {DEFAULT_KUBECONFIG_DEBOUNCE, ROOT_FILE_ENTRY} from '@constants/constants';

import {Project, ProjectConfig} from '@models/appconfig';
import {Size} from '@models/window';

import {useAppSelector} from '@redux/hooks';
import {setOpenProject, updateProjectConfig} from '@redux/reducers/appConfig';
import {currentConfigSelector} from '@redux/selectors';
import {loadContexts} from '@redux/thunks/loadKubeConfig';

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
  const currentConfig: ProjectConfig = useSelector(currentConfigSelector);
  const projects: Project[] = useAppSelector(state => state.config.projects);
  const projectConfig: ProjectConfig | null | undefined = useAppSelector(state => state.config.projectConfig);
  const fileMap = useAppSelector(state => state.main.fileMap);

  const onExecutedFrom = useCallback(
    (_, data) => {
      const project: Project =
        data.path ||
        (currentConfig?.settings?.loadLastProjectOnStartup && projects.length > 0 ? projects[0] : undefined);
      if (project && getFileStats(project.rootFolder)?.isDirectory()) {
        dispatch(setOpenProject(project.rootFolder));
      }
    },
    [currentConfig?.settings?.loadLastProjectOnStartup, projects]
  );

  useEffect(() => {
    ipcRenderer.on('executed-from', onExecutedFrom);
    return () => {
      ipcRenderer.removeListener('executed-from', onExecutedFrom);
    };
  }, [onExecutedFrom]);

  useDebounce(
    () => {
      console.log('currentConfig', currentConfig);
      if (currentConfig && currentConfig.kubeConfig && currentConfig.kubeConfig.path) {
        try {
          const kc = new k8s.KubeConfig();

          kc.loadFromFile(currentConfig.kubeConfig.path);
          dispatch(
            updateProjectConfig({
              ...projectConfig,
              kubeConfig: {
                ...projectConfig?.kubeConfig,
                isPathValid: Boolean(kc.contexts) || false,
              },
            })
          );
          loadContexts(currentConfig.kubeConfig.path, dispatch, currentConfig?.kubeConfig?.currentContext);
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
    [
      currentConfig.kubeConfig?.path,
      dispatch,
      projectConfig?.kubeConfig?.currentContext,
      fileMap[ROOT_FILE_ENTRY]?.filePath,
    ]
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
