import {ipcRenderer} from 'electron';

import React, {Suspense, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';
import {useDebounce} from 'react-use';

import {Modal} from 'antd';

import lodash from 'lodash';
import log from 'loglevel';
import path from 'path';
import semver from 'semver';

import {DEFAULT_KUBECONFIG_DEBOUNCE, ROOT_FILE_ENTRY} from '@constants/constants';
import {TelemetryDocumentationUrl} from '@constants/tooltips';

import {AlertEnum, ExtraContentType} from '@models/alert';
import {NewVersionCode, Project} from '@models/appconfig';
import {Size} from '@models/window';

import {useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {setCreateProject, setLoadingProject, setOpenProject} from '@redux/reducers/appConfig';
import {closePluginsDrawer} from '@redux/reducers/extension';
import {clearNotifications, closePreviewConfigurationEditor, reprocessAllResources} from '@redux/reducers/main';
import {
  closeFolderExplorer,
  closeReleaseNotesDrawer,
  handleWalkThroughStep,
  toggleNotifications,
  toggleSettings,
} from '@redux/reducers/ui';
import {isInClusterModeSelector, kubeConfigContextSelector, kubeConfigPathSelector} from '@redux/selectors';
import {loadContexts} from '@redux/thunks/loadKubeConfig';

import {HotKeysHandler, LazyDrawer, MessageBox, PageFooter, PageHeader, PaneManager} from '@organisms';
import UpdateNotice from '@organisms/UpdateNotice';

import FileExplorer from '@components/atoms/FileExplorer';
import {StepEnum} from '@components/molecules/WalkThrough/types';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {fetchAppVersion} from '@utils/appVersion';
import electronStore from '@utils/electronStore';
import {setMainProcessEnv} from '@utils/env';
import {getFileStats} from '@utils/files';
import {globalElectronStoreChanges} from '@utils/global-electron-store';
import {useWindowSize} from '@utils/hooks';
import {restartEditorPreview} from '@utils/restartEditorPreview';
import {StartupFlag} from '@utils/startupFlag';

import * as S from './App.styled';
import AppContext from './AppContext';

const AboutModal = React.lazy(() => import('@organisms/AboutModal'));
const ChangeFiltersConfirmModal = React.lazy(() => import('@molecules/ChangeFiltersConfirmModal'));
const ClusterDiffModal = React.lazy(() => import('@organisms/ClusterDiffModal'));
const ClusterResourceDiffModal = React.lazy(() => import('@organisms/ClusterResourceDiffModal'));
const CreateFolderModal = React.lazy(() => import('@organisms/CreateFolderModal'));
const CreateProjectModal = React.lazy(() => import('@organisms/CreateProjectModal'));
const KeyboardShortcuts = React.lazy(() => import('@components/organisms/KeyboardShortcuts'));
const LocalResourceDiffModal = React.lazy(() => import('@organisms/LocalResourceDiffModal'));
const NewResourceWizard = React.lazy(() => import('@organisms/NewResourceWizard'));
const NotificationsManager = React.lazy(() => import('@organisms/NotificationsManager'));
const QuickSearchActions = React.lazy(() => import('@organisms/QuickSearchActions'));
const PluginManager = React.lazy(() => import('@components/organisms/PluginManager'));
const PreviewConfigurationEditor = React.lazy(() => import('@components/organisms/PreviewConfigurationEditor'));
const ReleaseNotes = React.lazy(() => import('@components/organisms/ReleaseNotes'));
const RenameEntityModal = React.lazy(() => import('@organisms/RenameEntityModal'));
const RenameResourceModal = React.lazy(() => import('@organisms/RenameResourceModal'));
const SaveResourceToFileFolderModal = React.lazy(() => import('@molecules/SaveResourcesToFileFolderModal'));
const SettingsManager = React.lazy(() => import('@organisms/SettingsManager'));

const App = () => {
  const dispatch = useDispatch();

  const [showReleaseNotes, setShowReleaseNotes] = useState<boolean>(false);
  const [appVersion, setAppVersion] = useState<string>();

  const isChangeFiltersConfirmModalVisible = useAppSelector(state => state.main.filtersToBeChanged);
  const isClusterDiffModalVisible = useAppSelector(state => state.ui.isClusterDiffVisible);
  const previewConfigurationEditorState = useAppSelector(state => state.main.prevConfEditor);
  const isClusterSelectorVisible = useAppSelector(state => state.config.isClusterSelectorVisible);
  const isCreateFolderModalVisible = useAppSelector(state => state.ui.createFolderModal.isOpen);
  const isCreateProjectModalVisible = useAppSelector(state => state.ui.createProjectModal.isOpen);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isNewResourceWizardVisible = useAppSelector(state => state.ui.newResourceWizard.isOpen);
  const isReleaseNotesDrawerOpen = useAppSelector(state => state.ui.isReleaseNotesDrawerOpen);
  const isNotificationsDrawerVisible = useAppSelector(state => state.ui.isNotificationsOpen);
  const isQuickSearchActionsVisible = useAppSelector(state => state.ui.quickSearchActionsPopup.isOpen);
  const isPluginManagerDrawerVisible = useAppSelector(state => state.extension.isPluginsDrawerVisible);
  const isRenameEntityModalVisible = useAppSelector(state => state.ui.renameEntityModal.isOpen);
  const isRenameResourceModalVisible = useAppSelector(state => state.ui.renameResourceModal?.isOpen);
  const isSaveResourcesToFileFolderModalVisible = useAppSelector(
    state => state.ui.saveResourcesToFileFolderModal.isOpen
  );
  const isSettingsDrawerVisible = useAppSelector(state => state.ui.isSettingsOpen);
  const isAboutModalVisible = useAppSelector(state => state.ui.isAboutModalOpen);
  const isKeyboardShortcutsVisible = useAppSelector(state => state.ui.isKeyboardShortcutsModalOpen);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const loadLastProjectOnStartup = useAppSelector(state => state.config.loadLastProjectOnStartup);
  const newVersion = useAppSelector(state => state.config.newVersion);
  const projects: Project[] = useAppSelector(state => state.config.projects);
  const rootFile = useAppSelector(state => state.main.fileMap[ROOT_FILE_ENTRY]);
  const targetResourceId = useAppSelector(state => state.main.resourceDiff.targetResourceId);
  const k8sVersion = useAppSelector(state => state.config.projectConfig?.k8sVersion);
  const disableEventTracking = useAppSelector(state => state.config.disableEventTracking);
  const disableErrorReporting = useAppSelector(state => state.config.disableErrorReporting);

  const size: Size = useWindowSize();

  const isClusterResourceDiffModalVisible = useMemo(
    () => Boolean(targetResourceId) && isInClusterMode,
    [isInClusterMode, targetResourceId]
  );
  const isLocalResourceDiffModalVisible = useMemo(
    () => Boolean(targetResourceId) && !isInClusterMode,
    [isInClusterMode, targetResourceId]
  );
  const isUpdateNoticeVisible = useMemo(
    () =>
      (newVersion.code < NewVersionCode.Idle && !newVersion.data?.initial) ||
      newVersion.code === NewVersionCode.Downloaded,
    [newVersion]
  );

  const shouldTriggerTelemetryNotification = useMemo(
    () => disableEventTracking === undefined && disableErrorReporting === undefined,
    [disableEventTracking, disableErrorReporting]
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
    if (!shouldTriggerTelemetryNotification) {
      return;
    }
    dispatch(
      setAlert({
        title: 'Monokle telemetry',
        message: `We have enabled telemetry to learn more about Monokle use and be able to offer the best features around. **Data gathering is *(and will always be!)* anonymous**. We want to make sure you are cool with that, though! [Read more about this in our documentation.](${TelemetryDocumentationUrl})`,
        type: AlertEnum.Info,
        extraContentType: ExtraContentType.Telemetry,
        duration: 5,
      })
    );
  }, [shouldTriggerTelemetryNotification, dispatch]);

  useEffect(() => {
    ipcRenderer.on('executed-from', onExecutedFrom);
    return () => {
      ipcRenderer.removeListener('executed-from', onExecutedFrom);
    };
  }, [onExecutedFrom]);

  useEffect(() => {
    ipcRenderer.on('restart-preview', restartEditorPreview);
    return () => {
      ipcRenderer.removeListener('executed-from', restartEditorPreview);
    };
  }, []);

  useEffect(() => {
    fetchAppVersion().then(version => {
      const lastSeenReleaseNotesVersion = electronStore.get('appConfig.lastSeenReleaseNotesVersion');
      if (!semver.valid(lastSeenReleaseNotesVersion) || semver.lt(lastSeenReleaseNotesVersion, version)) {
        setAppVersion(version);
        setShowReleaseNotes(true);
      }
    });
  }, []);

  const onCloseReleaseNotes = useCallback(() => {
    setShowReleaseNotes(false);
    if (!electronStore.get('appConfig.lastSeenReleaseNotesVersion')) {
      dispatch(handleWalkThroughStep({step: StepEnum.Next, collection: 'novice'}));
    } else {
      dispatch(handleWalkThroughStep({step: StepEnum.Next, collection: 'release'}));
    }
    electronStore.set('appConfig.lastSeenReleaseNotesVersion', appVersion);
  }, [appVersion, dispatch]);

  // called from main thread because thunks cannot be dispatched by main
  const onOpenProjectFolderFromMainThread = useCallback((_: any, project: Project) => {
    if (project) {
      dispatch(setOpenProject(project.rootFolder));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    globalElectronStoreChanges.forEach(globalElectronStoreChange => {
      electronStore.onDidChange(globalElectronStoreChange.keyName, (newData: any, oldData: any) => {
        if (!newData || !oldData) {
          return;
        }
        if (
          lodash.isEqual(lodash.sortBy(newData.map((d: any) => d.name)), lodash.sortBy(oldData.map((d: any) => d.name)))
        ) {
          return;
        }

        const {shouldTriggerAcrossWindows, eventData} = globalElectronStoreChange.action(newData, oldData);

        if (!shouldTriggerAcrossWindows || !eventData) {
          return;
        }
        ipcRenderer.send('global-electron-store-update', eventData);
      });
    });
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

  useEffect(() => {
    dispatch(reprocessAllResources());
  }, [k8sVersion, dispatch]);

  const previewConfigurationDrawerOnClose = () => {
    dispatch(closePreviewConfigurationEditor());
  };

  const onCloseReleaseNotesDrawer = () => {
    dispatch(closeReleaseNotesDrawer());
  };

  return (
    <AppContext.Provider value={{windowSize: size}}>
      <S.AppContainer>
        <MessageBox />
        <S.MainContainer>
          <PageHeader />
          <PaneManager />
          <PageFooter />
        </S.MainContainer>
        <FileExplorer {...fileExplorerProps} />
        <HotKeysHandler />

        <LazyDrawer
          onClose={notificationsDrawerOnClose}
          title="Notifications"
          visible={isNotificationsDrawerVisible}
          extra={<S.Button onClick={() => dispatch(clearNotifications())}>Clear</S.Button>}
        >
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
          visible={previewConfigurationEditorState.isOpen}
        >
          <PreviewConfigurationEditor key={previewConfigurationEditorState.helmChartId} />
        </LazyDrawer>

        <LazyDrawer title="New Release" visible={isReleaseNotesDrawerOpen} onClose={onCloseReleaseNotesDrawer}>
          <ReleaseNotes onClose={onCloseReleaseNotesDrawer} singleColumn />
        </LazyDrawer>

        {isUpdateNoticeVisible && <UpdateNotice />}

        <Suspense fallback={null}>
          {isAboutModalVisible && <AboutModal />}
          {isChangeFiltersConfirmModalVisible && <ChangeFiltersConfirmModal />}
          {isClusterDiffModalVisible && <ClusterDiffModal />}
          {isClusterResourceDiffModalVisible && <ClusterResourceDiffModal />}
          {isCreateFolderModalVisible && <CreateFolderModal />}
          {isCreateProjectModalVisible && <CreateProjectModal />}
          {isKeyboardShortcutsVisible && <KeyboardShortcuts />}
          {isLocalResourceDiffModalVisible && <LocalResourceDiffModal />}
          {isNewResourceWizardVisible && <NewResourceWizard />}
          {isQuickSearchActionsVisible && <QuickSearchActions />}
          {isRenameEntityModalVisible && <RenameEntityModal />}
          {isRenameResourceModalVisible && <RenameResourceModal />}
          {isSaveResourcesToFileFolderModalVisible && <SaveResourceToFileFolderModal />}
          {showReleaseNotes && (
            <Modal
              width="900px"
              title="New Release"
              visible={showReleaseNotes}
              onCancel={onCloseReleaseNotes}
              centered
              footer={null}
            >
              <ReleaseNotes onClose={onCloseReleaseNotes} />
            </Modal>
          )}
        </Suspense>
      </S.AppContainer>
    </AppContext.Provider>
  );
};

export default App;

export const ErrorFallback = ({error}: any) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
};
