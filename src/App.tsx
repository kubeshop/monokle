import {ipcRenderer} from 'electron';

import React, {useCallback, useEffect} from 'react';
import {useEffectOnce, useMount} from 'react-use';

import lodash from 'lodash';
import log from 'loglevel';
import path from 'path';

import {activeProjectSelector, setKubeConfig, setLoadingProject} from '@redux/appConfig';
import {startWatchingKubeconfig} from '@redux/cluster/listeners/kubeconfig';
import {setIsGitInstalled} from '@redux/git';
import {isGitInstalled} from '@redux/git/git.ipc';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {clearNotifications, closePreviewConfigurationEditor} from '@redux/reducers/main';
import {closeFolderExplorer, closeReleaseNotesDrawer, toggleNotifications} from '@redux/reducers/ui';
import {setCreateProject, setOpenProject} from '@redux/thunks/project';
import {loadValidation} from '@redux/validation/validation.thunks';

import {GlobalModals, HotKeysHandler, LazyDrawer, MessageBox, PageHeader, PaneManager} from '@organisms';

import {FileExplorer} from '@atoms';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {getFileStats} from '@utils/files';
import {globalElectronStoreChanges} from '@utils/global-electron-store';
import {useWindowSize} from '@utils/hooks';
import {restartEditorPreview} from '@utils/restartEditorPreview';
import {StartupFlag} from '@utils/startupFlag';

import {AlertEnum} from '@shared/models/alert';
import {Project} from '@shared/models/config';
import {Size} from '@shared/models/window';
import electronStore from '@shared/utils/electronStore';
import {setMainProcessEnv} from '@shared/utils/env';
import {isEqual} from '@shared/utils/isEqual';

import * as S from './App.styled';
import AppContext from './AppContext';

const NotificationsManager = React.lazy(() => import('@organisms/NotificationsManager'));
const PreviewConfigurationEditor = React.lazy(() => import('@organisms/PreviewConfigurationEditor'));
const ReleaseNotes = React.lazy(() => import('@organisms/ReleaseNotes'));

const App = () => {
  const dispatch = useAppDispatch();

  const activeProject = useAppSelector(activeProjectSelector);
  const isReleaseNotesDrawerOpen = useAppSelector(state => state.ui.isReleaseNotesDrawerOpen);
  const isNotificationsDrawerVisible = useAppSelector(state => state.ui.isNotificationsOpen);
  const isInQuickClusterMode = useAppSelector(state => state.ui.isInQuickClusterMode);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const loadLastProjectOnStartup = useAppSelector(state => state.config.loadLastProjectOnStartup);
  const previewConfigurationEditorState = useAppSelector(state => state.main.prevConfEditor);
  const projects: Project[] = useAppSelector(state => state.config.projects);

  const size: Size = useWindowSize();

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
    const kubeconfig = electronStore.get('appConfig.kubeConfig');
    dispatch(setKubeConfig({path: kubeconfig}));
    dispatch(startWatchingKubeconfig());
  }, [dispatch]);

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

  useMount(() => {
    const fetchIsGitInstalled = async () => {
      try {
        await isGitInstalled({});
        dispatch(setIsGitInstalled(true));
      } catch (error) {
        dispatch(setIsGitInstalled(false));
      }
    };

    fetchIsGitInstalled();
  });

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
        if (isEqual(lodash.sortBy(newData.map((d: any) => d.name)), lodash.sortBy(oldData.map((d: any) => d.name)))) {
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
          title="Dry-run Configuration"
          visible={previewConfigurationEditorState.isOpen}
        >
          <PreviewConfigurationEditor key={previewConfigurationEditorState.helmChartId} />
        </LazyDrawer>

        <LazyDrawer title="New Release" visible={isReleaseNotesDrawerOpen} onClose={onCloseReleaseNotesDrawer}>
          <ReleaseNotes onClose={onCloseReleaseNotesDrawer} singleColumn />
        </LazyDrawer>

        <GlobalModals />
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
