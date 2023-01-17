import {Modal} from 'antd';

import {createAsyncThunk} from '@reduxjs/toolkit';

import {setChangedFiles, setGitLoading, setRepo} from '@redux/git';
import {SetRootFolderPayload} from '@redux/reducers/main';
import {currentConfigSelector} from '@redux/selectors';
import {createRootFileEntry, readFiles} from '@redux/services/fileEntry';
import {monitorRootFolder} from '@redux/services/fileMonitor';
import {createRejectionWithAlert} from '@redux/thunks/utils';

import {getFileStats} from '@utils/files';
import {promiseFromIpcRenderer} from '@utils/promises';
import {addDefaultCommandTerminal} from '@utils/terminal';

import {AlertEnum} from '@shared/models/alert';
import {AppDispatch} from '@shared/models/appDispatch';
import {FileMapType, HelmChartMapType, HelmTemplatesMapType, HelmValuesMapType} from '@shared/models/appState';
import {GitChangedFile, GitRepo} from '@shared/models/git';
import {ResourceContentMap, ResourceMetaMap} from '@shared/models/k8sResource';
import {LocalOrigin} from '@shared/models/origin';
import {RootState} from '@shared/models/rootState';
import {trackEvent} from '@shared/utils/telemetry';

/**
 * Thunk to set the specified root folder
 */

export const setRootFolder = createAsyncThunk<
  SetRootFolderPayload,
  string | null,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/setRootFolder', async (rootFolder, thunkAPI) => {
  const startTime = new Date().getTime();
  const projectConfig = currentConfigSelector(thunkAPI.getState());
  const terminalState = thunkAPI.getState().terminal;

  const resourceMetaMap: ResourceMetaMap<LocalOrigin> = {};
  const resourceContentMap: ResourceContentMap<LocalOrigin> = {};
  const fileMap: FileMapType = {};
  const helmChartMap: HelmChartMapType = {};
  const helmValuesMap: HelmValuesMapType = {};
  const helmTemplatesMap: HelmTemplatesMapType = {};

  if (!rootFolder) {
    return {
      projectConfig,
      fileMap,
      resourceMetaMap,
      resourceContentMap,
      helmChartMap,
      helmValuesMap,
      helmTemplatesMap,
    };
  }

  const stats = getFileStats(rootFolder);

  if (!stats) {
    return createRejectionWithAlert(thunkAPI, 'Missing folder', `Folder ${rootFolder} does not exist`);
  }

  if (!stats.isDirectory()) {
    return createRejectionWithAlert(thunkAPI, 'Invalid path', `Specified path ${rootFolder} is not a folder`);
  }

  const rootEntry = createRootFileEntry(rootFolder, fileMap);

  // this Promise is needed for `setRootFolder.pending` action to be dispatched correctly
  const readFilesPromise = new Promise<string[]>(resolve => {
    setImmediate(() => {
      resolve(
        readFiles(rootFolder, {
          projectConfig,
          resourceMetaMap,
          resourceContentMap,
          fileMap,
          helmChartMap,
          helmValuesMap,
          helmTemplatesMap,
        })
      );
    });
  });
  const files = await readFilesPromise;

  rootEntry.children = files;

  monitorRootFolder(rootFolder, thunkAPI);

  const generatedAlert = {
    title: 'Folder Import',
    message: `${Object.values(resourceMetaMap).length} resources found in ${
      Object.values(fileMap).filter(f => !f.children).length
    } files`,
    type: AlertEnum.Success,
  };

  const isFolderGitRepo = await promiseFromIpcRenderer<boolean>(
    'git.isFolderGitRepo',
    'git.isFolderGitRepo.result',
    rootFolder
  );

  if (isFolderGitRepo) {
    thunkAPI.dispatch(setGitLoading(true));

    Promise.all([
      promiseFromIpcRenderer<GitRepo>('git.getGitRepoInfo', 'git.getGitRepoInfo.result', rootFolder),
      promiseFromIpcRenderer<GitChangedFile[]>('git.getChangedFiles', 'git.getChangedFiles.result', {
        localPath: rootFolder,
        fileMap,
      }),
    ]).then(([repo, changedFiles]) => {
      thunkAPI.dispatch(setRepo(repo));
      thunkAPI.dispatch(setChangedFiles(changedFiles));
      thunkAPI.dispatch(setGitLoading(false));

      if (repo.remoteRepo.authRequired) {
        Modal.warning({
          title: 'Authentication failed',
          content: `${repo.remoteRepo.errorMessage}. Please sign in using the terminal.`,
          zIndex: 100000,
          onCancel: () => {
            addDefaultCommandTerminal(
              terminalState.terminalsMap,
              `git remote show origin`,
              terminalState.settings.defaultShell,
              thunkAPI.getState().ui.leftMenu.bottomSelection,
              thunkAPI.dispatch
            );
          },
          onOk: () => {
            addDefaultCommandTerminal(
              terminalState.terminalsMap,
              `git remote show origin`,
              terminalState.settings.defaultShell,
              thunkAPI.getState().ui.leftMenu.bottomSelection,
              thunkAPI.dispatch
            );
          },
        });
      }
    });
  }

  const endTime = new Date().getTime();

  trackEvent('app_start/open_project', {
    numberOfFiles: Object.values(fileMap).filter(f => !f.children).length,
    numberOfResources: Object.values(resourceMetaMap).length,
    executionTime: endTime - startTime,
  });

  // TODO: process resources in validation listener after folder was loaded

  return {
    projectConfig,
    fileMap,
    resourceMetaMap,
    resourceContentMap,
    helmChartMap,
    helmValuesMap,
    helmTemplatesMap,
    isScanExcludesUpdated: 'applied',
    isScanIncludesUpdated: 'applied',
    alert: rootFolder ? generatedAlert : undefined,
    isGitRepo: isFolderGitRepo,
  };
});
