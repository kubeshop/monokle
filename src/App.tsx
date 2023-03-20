import {ipcRenderer} from 'electron';

import React, {Suspense, useCallback, useEffect, useMemo, useState} from 'react';
import {useEffectOnce, useMount} from 'react-use';

import {Modal} from 'antd';

import fs from 'fs';
import lodash from 'lodash';
import log from 'loglevel';
import path from 'path';
import semver from 'semver';

import {TelemetryDocumentationUrl} from '@constants/tooltips';

import {
  activeProjectSelector,
  isInClusterModeSelector,
  setCreateProject,
  setDeleteProject,
  setLoadingProject,
  setOpenProject,
} from '@redux/appConfig';
import {toggleForm} from '@redux/forms';
import {setIsGitInstalled} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {clearNotifications, closePreviewConfigurationEditor} from '@redux/reducers/main';
import {closeFolderExplorer, closeReleaseNotesDrawer, openWelcomePopup, toggleNotifications} from '@redux/reducers/ui';
import {loadValidation} from '@redux/validation/validation.thunks';

import {GitCloneModal, HotKeysHandler, LazyDrawer, MessageBox, PageHeader, PaneManager, UpdateNotice} from '@organisms';

import {FileExplorer} from '@atoms';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {fetchAppVersion} from '@utils/appVersion';
import {getFileStats} from '@utils/files';
import {fetchIsGitInstalled} from '@utils/git';
import {globalElectronStoreChanges} from '@utils/global-electron-store';
import {useWindowSize} from '@utils/hooks';
import {restartEditorPreview} from '@utils/restartEditorPreview';
import {StartupFlag} from '@utils/startupFlag';

import {AlertEnum, ExtraContentType} from '@shared/models/alert';
import {NewVersionCode, Project} from '@shared/models/config';
import {Size} from '@shared/models/window';
import electronStore from '@shared/utils/electronStore';
import {setMainProcessEnv} from '@shared/utils/env';

import * as S from './App.styled';
import AppContext from './AppContext';

const AboutModal = React.lazy(() => import('@organisms/AboutModal'));
const ChangeFiltersConfirmModal = React.lazy(() => import('@molecules/ChangeFiltersConfirmModal'));
const ClusterResourceDiffModal = React.lazy(() => import('@organisms/ClusterResourceDiffModal'));
const CreateFileFolderModal = React.lazy(() => import('@organisms/CreateFileFolderModal'));
const CreateProjectModal = React.lazy(() => import('@organisms/CreateProjectModal'));
const FileCompareModal = React.lazy(() => import('@organisms/FileCompareModal'));
const FiltersPresetModal = React.lazy(() => import('@organisms/FiltersPresetModal'));
const FormEditorModal = React.lazy(() => import('@components/organisms/FormEditorModal'));
const KeyboardShortcuts = React.lazy(() => import('@organisms/KeyboardShortcuts'));
const LocalResourceDiffModal = React.lazy(() => import('@organisms/LocalResourceDiffModal'));
const NewResourceWizard = React.lazy(() => import('@organisms/NewResourceWizard'));
const NotificationsManager = React.lazy(() => import('@organisms/NotificationsManager'));
const QuickSearchActions = React.lazy(() => import('@organisms/QuickSearchActions'));
const PreviewConfigurationEditor = React.lazy(() => import('@organisms/PreviewConfigurationEditor'));
const ReleaseNotes = React.lazy(() => import('@organisms/ReleaseNotes'));
const RenameEntityModal = React.lazy(() => import('@organisms/RenameEntityModal'));
const RenameResourceModal = React.lazy(() => import('@organisms/RenameResourceModal'));
const ReplaceImageModal = React.lazy(() => import('@organisms/ReplaceImageModal'));
const SaveEditCommandModal = React.lazy(() => import('@organisms/SaveEditCommandModal'));
const SaveResourcesToFileFolderModal = React.lazy(() => import('@molecules/SaveResourcesToFileFolderModal'));
const TemplateExplorer = React.lazy(() => import('@organisms/TemplateExplorer'));

const App = () => {
  const dispatch = useAppDispatch();

  const [showReleaseNotes, setShowReleaseNotes] = useState<boolean>(false);
  const [appVersion, setAppVersion] = useState<string>();

  const activeProject = useAppSelector(activeProjectSelector);
  const isChangeFiltersConfirmModalVisible = useAppSelector(state => state.main.filtersToBeChanged);
  const isCreateFileFolderModalVisible = useAppSelector(state => state.ui.createFileFolderModal.isOpen);
  const isCreateProjectModalVisible = useAppSelector(state => state.ui.createProjectModal.isOpen);
  const isFileCompareModalVisible = useAppSelector(state => state.ui.fileCompareModal.isVisible);
  const isFiltersPresetModalVisible = useAppSelector(state => state.ui.filtersPresetModal?.isOpen);
  const isGitCloneModalVisible = useAppSelector(state => state.git.gitCloneModal.open);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isNewResourceWizardVisible = useAppSelector(state => state.ui.newResourceWizard.isOpen);
  const isReleaseNotesDrawerOpen = useAppSelector(state => state.ui.isReleaseNotesDrawerOpen);
  const isNotificationsDrawerVisible = useAppSelector(state => state.ui.isNotificationsOpen);
  const isQuickSearchActionsVisible = useAppSelector(state => state.ui.quickSearchActionsPopup.isOpen);
  const isInQuickClusterMode = useAppSelector(state => state.ui.isInQuickClusterMode);
  const isRenameEntityModalVisible = useAppSelector(state => state.ui.renameEntityModal.isOpen);
  const isRenameResourceModalVisible = useAppSelector(state => state.ui.renameResourceModal?.isOpen);
  const isReplaceImageModalVisible = useAppSelector(state => state.ui.replaceImageModal?.isOpen);
  const isSaveEditCommandModalVisible = useAppSelector(state => state.ui.saveEditCommandModal.isOpen);
  const isSaveResourcesToFileFolderModalVisible = useAppSelector(
    state => state.ui.saveResourcesToFileFolderModal.isOpen
  );
  const isFormModalVisible = useAppSelector(state => state.form.isOpen);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const isAboutModalVisible = useAppSelector(state => state.ui.isAboutModalOpen);
  const isKeyboardShortcutsVisible = useAppSelector(state => state.ui.isKeyboardShortcutsModalOpen);
  const isTemplateExplorerVisible = useAppSelector(state => state.ui.templateExplorer.isVisible);
  const loadLastProjectOnStartup = useAppSelector(state => state.config.loadLastProjectOnStartup);
  const newVersion = useAppSelector(state => state.config.newVersion);
  const previewConfigurationEditorState = useAppSelector(state => state.main.prevConfEditor);
  const projects: Project[] = useAppSelector(state => state.config.projects);
  const targetResourceId = useAppSelector(state => state.main.resourceDiff.targetResourceId);
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
  const isUpdateNoticeVisible = useMemo(() => {
    if (!appVersion) {
      return false;
    }

    return (
      semver.patch(appVersion) === 0 &&
      ((newVersion.code < NewVersionCode.Idle && !newVersion.data?.initial) ||
        newVersion.code === NewVersionCode.Downloaded)
    );
  }, [appVersion, newVersion]);

  const shouldTriggerTelemetryNotification = useMemo(
    () => disableEventTracking === undefined && disableErrorReporting === undefined,
    [disableEventTracking, disableErrorReporting]
  );

  const onExecutedFrom = useCallback(
    (_: any, data: any) => {
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
        id: 'monokle_telemetry_alert',
      })
    );
  }, [shouldTriggerTelemetryNotification, dispatch]);

  useEffect(() => {
    ipcRenderer.invoke('initKubeConfig');
  }, []);

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
      setAppVersion(version);

      const lastSeenReleaseNotesVersion = electronStore.get('appConfig.lastSeenReleaseNotesVersion');

      const nextMajorReleaseVersion = semver.inc(lastSeenReleaseNotesVersion, 'minor');

      // new user
      if (!semver.valid(lastSeenReleaseNotesVersion)) {
        dispatch(openWelcomePopup());
        electronStore.set('appConfig.lastSeenReleaseNotesVersion', version);
      } else if (
        // check if the current version is the next big release version for showing the modal with release notes
        semver.valid(lastSeenReleaseNotesVersion) &&
        semver.satisfies(version, `>=${nextMajorReleaseVersion}`)
      ) {
        setShowReleaseNotes(true);
      }

      // if middle release, show silent notification
      else if (semver.satisfies(version, `>${lastSeenReleaseNotesVersion} <${nextMajorReleaseVersion}`)) {
        dispatch(
          setAlert({
            title: 'A new version of Monokle has been installed!',
            message: '',
            type: AlertEnum.Success,
            silent: true,
          })
        );

        electronStore.set('appConfig.lastSeenReleaseNotesVersion', version);
      }
    });

    // check if current projects root folder still exists, otherwise delete it
    projects.forEach(project => {
      if (!fs.existsSync(project.rootFolder)) {
        dispatch(setDeleteProject(project));
        dispatch(
          setAlert({
            title: 'Project removed',
            message: `We removed project ${project.name} from Monokle because its root folder no longer exists`,
            type: AlertEnum.Warning,
          })
        );
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMount(() => {
    fetchIsGitInstalled().then(isGitInstalled => {
      dispatch(setIsGitInstalled(isGitInstalled));
    });
  });

  const onCloseReleaseNotes = useCallback(() => {
    setShowReleaseNotes(false);
    electronStore.set('appConfig.lastSeenReleaseNotesVersion', appVersion);
  }, [appVersion]);

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

  useEffectOnce(() => {
    dispatch(loadValidation());
  });

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

  const previewConfigurationDrawerOnClose = useCallback(() => {
    dispatch(closePreviewConfigurationEditor());
  }, [dispatch]);

  const onCloseReleaseNotesDrawer = useCallback(() => {
    dispatch(closeReleaseNotesDrawer());
  }, [dispatch]);

  const onCloseFormModal = useCallback(() => {
    dispatch(toggleForm(false));
  }, [dispatch]);

  return (
    <AppContext.Provider value={{windowSize: size}}>
      <S.AppContainer>
        <MessageBox />
        <S.MainContainer>
          {(isInQuickClusterMode || (activeProject && !isStartProjectPaneVisible)) && <PageHeader />}

          <PaneManager />
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
          {isClusterResourceDiffModalVisible && <ClusterResourceDiffModal />}
          {isFileCompareModalVisible && <FileCompareModal />}
          {isFormModalVisible && <FormEditorModal visible={isFormModalVisible} onClose={onCloseFormModal} />}
          {isCreateFileFolderModalVisible && <CreateFileFolderModal />}
          {isCreateProjectModalVisible && <CreateProjectModal />}
          {isFiltersPresetModalVisible && <FiltersPresetModal />}
          {isGitCloneModalVisible && <GitCloneModal />}
          {isKeyboardShortcutsVisible && <KeyboardShortcuts />}
          {isLocalResourceDiffModalVisible && <LocalResourceDiffModal />}
          {isNewResourceWizardVisible && <NewResourceWizard />}
          {isQuickSearchActionsVisible && <QuickSearchActions />}
          {isRenameEntityModalVisible && <RenameEntityModal />}
          {isRenameResourceModalVisible && <RenameResourceModal />}
          {isReplaceImageModalVisible && <ReplaceImageModal />}
          {isSaveEditCommandModalVisible && <SaveEditCommandModal />}
          {isSaveResourcesToFileFolderModalVisible && <SaveResourcesToFileFolderModal />}
          {showReleaseNotes && (
            <Modal
              width="900px"
              title="New Release"
              open={showReleaseNotes}
              onCancel={onCloseReleaseNotes}
              centered
              footer={null}
            >
              <ReleaseNotes onClose={onCloseReleaseNotes} />
            </Modal>
          )}
          {isTemplateExplorerVisible && <TemplateExplorer />}
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
