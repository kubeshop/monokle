import {ipcRenderer} from 'electron';

import React, {Suspense, useCallback, useEffect, useMemo} from 'react';
import {useDispatch} from 'react-redux';
import {useDebounce} from 'react-use';

import 'antd/dist/antd.less';

import log from 'loglevel';
import path from 'path';
import styled from 'styled-components';

import {DEFAULT_KUBECONFIG_DEBOUNCE, ROOT_FILE_ENTRY} from '@constants/constants';

import {AlertEnum} from '@models/alert';
import {NewVersionCode, Project} from '@models/appconfig';
import {Size} from '@models/window';

import {useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {setCreateProject, setLoadingProject, setOpenProject} from '@redux/reducers/appConfig';
import {closePluginsDrawer} from '@redux/reducers/extension';
import {closePreviewConfigurationEditor} from '@redux/reducers/main';
import {closeFolderExplorer, toggleNotifications, toggleSettings} from '@redux/reducers/ui';
import {isInClusterModeSelector, kubeConfigContextSelector, kubeConfigPathSelector} from '@redux/selectors';
import {loadContexts} from '@redux/thunks/loadKubeConfig';

import {HotKeysHandler, LazyDrawer, MessageBox, PageFooter, PageHeader, PaneManager} from '@organisms';

import FileExplorer from '@components/atoms/FileExplorer';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {setMainProcessEnv} from '@utils/env';
import {getFileStats} from '@utils/files';
import {useWindowSize} from '@utils/hooks';
import {StartupFlag} from '@utils/startupFlag';

import AppContext from './AppContext';

const ChangeFiltersConfirmModal = React.lazy(() => import('@molecules/ChangeFiltersConfirmModal'));
const ClusterDiffModal = React.lazy(() => import('@organisms/ClusterDiffModal'));
const ClusterResourceDiffModal = React.lazy(() => import('@organisms/ClusterResourceDiffModal'));
const CreateFolderModal = React.lazy(() => import('@organisms/CreateFolderModal'));
const CreateProjectModal = React.lazy(() => import('@organisms/CreateProjectModal'));
const LocalResourceDiffModal = React.lazy(() => import('@organisms/LocalResourceDiffModal'));
const NewResourceWizard = React.lazy(() => import('@organisms/NewResourceWizard'));
const NotificationsManager = React.lazy(() => import('@organisms/NotificationsManager'));
const QuickSearchActions = React.lazy(() => import('@organisms/QuickSearchActions'));
const PluginManager = React.lazy(() => import('@components/organisms/PluginManager'));
const RenameEntityModal = React.lazy(() => import('@organisms/RenameEntityModal'));
const RenameResourceModal = React.lazy(() => import('@organisms/RenameResourceModal'));
const SaveResourceToFileFolderModal = React.lazy(() => import('@molecules/SaveResourcesToFileFolderModal'));
const SettingsManager = React.lazy(() => import('@organisms/SettingsManager'));
const StartupModal = React.lazy(() => import('@organisms/StartupModal'));
const UpdateModal = React.lazy(() => import('@organisms/UpdateModal'));
const PreviewConfigurationEditor = React.lazy(() => import('@components/organisms/PreviewConfigurationEditor'));

const AppContainer = styled.div`
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

const MainContainer = styled.div`
  height: 100%;
  width: 100%;

  display: grid;
  grid-template-rows: max-content 1fr max-content;
`;

const App = () => {
  const dispatch = useDispatch();
  const isChangeFiltersConfirmModalVisible = useAppSelector(state => state.main.filtersToBeChanged);
  const isClusterDiffModalVisible = useAppSelector(state => state.ui.isClusterDiffVisible);
  const isPreviewConfigurationEditorOpen = useAppSelector(state => state.main.prevConfEditor.isOpen);
  const isClusterSelectorVisible = useAppSelector(state => state.config.isClusterSelectorVisible);
  const isCreateFolderModalVisible = useAppSelector(state => state.ui.createFolderModal.isOpen);
  const isCreateProjectModalVisible = useAppSelector(state => state.ui.createProjectModal.isOpen);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isNewResourceWizardVisible = useAppSelector(state => state.ui.newResourceWizard.isOpen);
  const isNotificationsDrawerVisible = useAppSelector(state => state.ui.isNotificationsOpen);
  const isQuickSearchActionsVisible = useAppSelector(state => state.ui.quickSearchActionsPopup.isOpen);
  const isPluginManagerDrawerVisible = useAppSelector(state => state.extension.isPluginsDrawerVisible);
  const isRenameEntityModalVisible = useAppSelector(state => state.ui.renameEntityModal.isOpen);
  const isRenameResourceModalVisible = useAppSelector(state => state.ui.renameResourceModal?.isOpen);
  const isSaveResourcesToFileFolderModalVisible = useAppSelector(
    state => state.ui.saveResourcesToFileFolderModal.isOpen
  );
  const isSettingsDrawerVisible = useAppSelector(state => state.ui.isSettingsOpen);
  const isStartupModalVisible = useAppSelector(state => state.config.isStartupModalVisible);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const loadLastProjectOnStartup = useAppSelector(state => state.config.loadLastProjectOnStartup);
  const newVersion = useAppSelector(state => state.config.newVersion);
  const projects: Project[] = useAppSelector(state => state.config.projects);
  const rootFile = useAppSelector(state => state.main.fileMap[ROOT_FILE_ENTRY]);
  const targetResourceId = useAppSelector(state => state.main.resourceDiff.targetResourceId);

  const size: Size = useWindowSize();

  const isClusterResourceDiffModalVisible = useMemo(
    () => Boolean(targetResourceId) && isInClusterMode,
    [isInClusterMode, targetResourceId]
  );
  const isLocalResourceDiffModalVisible = useMemo(
    () => Boolean(targetResourceId) && !isInClusterMode,
    [isInClusterMode, targetResourceId]
  );
  const isUpdateModalVisible = useMemo(
    () =>
      (newVersion.code < NewVersionCode.Idle && !newVersion.data?.initial) ||
      newVersion.code === NewVersionCode.Downloaded,
    [newVersion]
  );

  const onExecutedFrom = useCallback(
    (_, data) => {
      const targetPath = data?.path?.startsWith('.') ? path.resolve(data.path) : data.path;
      if (targetPath) {
        const selectedProject: Project | undefined | null = projects.find(p => p.rootFolder === targetPath);
        if (selectedProject && getFileStats(selectedProject.rootFolder)?.isDirectory()) {
          dispatch(setOpenProject(selectedProject.rootFolder));
        } else {
          dispatch(setCreateProject({rootFolder: targetPath}));
        }
        dispatch(setLoadingProject(false));
        return;
      }

      const selectedProject: Project | undefined | null = projects.length > 0 ? projects[0] : undefined;
      if (loadLastProjectOnStartup) {
        if (selectedProject && getFileStats(selectedProject.rootFolder)?.isDirectory()) {
          dispatch(setOpenProject(selectedProject.rootFolder));
        }
      }
      dispatch(setLoadingProject(false));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadLastProjectOnStartup, projects]
  );

  useEffect(() => {
    ipcRenderer.on('executed-from', onExecutedFrom);
    return () => {
      ipcRenderer.removeListener('executed-from', onExecutedFrom);
    };
  }, [onExecutedFrom]);

  // called from main thread because thunks cannot be dispatched by main
  const onOpenProjectFolderFromMainThread = useCallback((_: any, project: Project) => {
    if (project) {
      dispatch(setOpenProject(project.rootFolder));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    ipcRenderer.on('open-project', onOpenProjectFolderFromMainThread);
    return () => {
      ipcRenderer.removeListener('open-project', onOpenProjectFolderFromMainThread);
    };
  }, [onOpenProjectFolderFromMainThread]);

  const onSetAutomation = useCallback(() => {
    StartupFlag.getInstance().automationFlag = true;
  }, []);

  useEffect(() => {
    ipcRenderer.on('set-automation', onSetAutomation);
    return () => {
      ipcRenderer.removeListener('set-automation', onSetAutomation);
    };
  }, [onSetAutomation]);

  const onSetMainProcessEnv = useCallback(
    (_: any, args: any) => {
      try {
        if (args && typeof args.serializedMainProcessEnv === 'string') {
          setMainProcessEnv(JSON.parse(args.serializedMainProcessEnv));
        } else {
          throw new Error('serializedMainProcessEnv is not of type string');
        }
      } catch (e: any) {
        log.warn(`[onSetMainProcessEnv]": ${e.message || ''}`);
        dispatch(
          setAlert({
            title: 'Environment loading failed',
            message: "Couldn't load your environment variables",
            type: AlertEnum.Warning,
          })
        );
      }
    },
    [dispatch]
  );

  useEffect(() => {
    ipcRenderer.on('set-main-process-env', onSetMainProcessEnv);
    return () => {
      ipcRenderer.removeListener('set-main-process-env', onSetMainProcessEnv);
    };
  }, [onSetMainProcessEnv]);

  useDebounce(
    () => {
      loadContexts(kubeConfigPath, dispatch, kubeConfigContext);
    },
    DEFAULT_KUBECONFIG_DEBOUNCE,
    [kubeConfigPath, dispatch, kubeConfigContext, rootFile, isClusterSelectorVisible]
  );

  const isFolderExplorerOpen = useAppSelector(state => state.ui.folderExplorer.isOpen);

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (folderPath) {
        dispatch(setCreateProject({rootFolder: folderPath}));
      }
    },
    {isDirectoryExplorer: true}
  );

  useEffect(() => {
    if (isFolderExplorerOpen) {
      openFileExplorer();
      dispatch(closeFolderExplorer());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFolderExplorerOpen]);

  const notificationsDrawerOnClose = () => {
    dispatch(toggleNotifications());
  };

  const pluginsDrawerOnClose = () => {
    dispatch(closePluginsDrawer());
  };

  const settingsDrawerOnClose = () => {
    dispatch(toggleSettings());
  };

  const previewConfigurationDrawerOnClose = () => {
    dispatch(closePreviewConfigurationEditor());
  };

  return (
    <AppContext.Provider value={{windowSize: size}}>
      <AppContainer>
        <MessageBox />
        <MainContainer>
          <PageHeader />
          <PaneManager />
          <PageFooter />
        </MainContainer>
        <FileExplorer {...fileExplorerProps} />
        <HotKeysHandler />

        <LazyDrawer onClose={notificationsDrawerOnClose} title="Notifications" visible={isNotificationsDrawerVisible}>
          <NotificationsManager />
        </LazyDrawer>

        <LazyDrawer
          noPadding
          onClose={pluginsDrawerOnClose}
          title="Plugins Manager"
          visible={isPluginManagerDrawerVisible}
        >
          <PluginManager />
        </LazyDrawer>

        <LazyDrawer noPadding onClose={settingsDrawerOnClose} title="Settings" visible={isSettingsDrawerVisible}>
          <SettingsManager />
        </LazyDrawer>

        <LazyDrawer
          onClose={previewConfigurationDrawerOnClose}
          title="Preview Configuration"
          visible={isPreviewConfigurationEditorOpen}
        >
          <PreviewConfigurationEditor />
        </LazyDrawer>

        <Suspense fallback={null}>
          {isChangeFiltersConfirmModalVisible && <ChangeFiltersConfirmModal />}
          {isClusterDiffModalVisible && <ClusterDiffModal />}
          {isClusterResourceDiffModalVisible && <ClusterResourceDiffModal />}
          {isCreateFolderModalVisible && <CreateFolderModal />}
          {isCreateProjectModalVisible && <CreateProjectModal />}
          {isLocalResourceDiffModalVisible && <LocalResourceDiffModal />}
          {isNewResourceWizardVisible && <NewResourceWizard />}
          {isQuickSearchActionsVisible && <QuickSearchActions />}
          {isRenameEntityModalVisible && <RenameEntityModal />}
          {isRenameResourceModalVisible && <RenameResourceModal />}
          {isSaveResourcesToFileFolderModalVisible && <SaveResourceToFileFolderModal />}
          {isStartupModalVisible && <StartupModal />}
          {isUpdateModalVisible && <UpdateModal />}
        </Suspense>
      </AppContainer>
    </AppContext.Provider>
  );
};

export default App;
