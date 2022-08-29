import {createAsyncThunk} from '@reduxjs/toolkit';

import {AlertEnum} from '@models/alert';
import {AppDispatch} from '@models/appdispatch';
import {
  FileMapType,
  HelmChartMapType,
  HelmTemplatesMapType,
  HelmValuesMapType,
  ResourceMapType,
} from '@models/appstate';
import {GitRepo} from '@models/git';
import {RootState} from '@models/rootstate';

import {SetRootFolderPayload} from '@redux/reducers/main';
import {currentConfigSelector} from '@redux/selectors';
import {createRootFileEntry, readFiles} from '@redux/services/fileEntry';
import {monitorRootFolder} from '@redux/services/fileMonitor';
import {processKustomizations} from '@redux/services/kustomize';
import {getK8sVersion} from '@redux/services/projectConfig';
import {processResources} from '@redux/services/resource';
import {createRejectionWithAlert} from '@redux/thunks/utils';

import {getFileStats} from '@utils/files';
import {promiseFromIpcRenderer} from '@utils/promises';
import {OPEN_EXISTING_PROJECT, trackEvent} from '@utils/telemetry';

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
  const projectConfig = currentConfigSelector(thunkAPI.getState());
  const userDataDir = thunkAPI.getState().config.userDataDir;
  const resourceRefsProcessingOptions = thunkAPI.getState().main.resourceRefsProcessingOptions;
  const resourceMap: ResourceMapType = {};
  const fileMap: FileMapType = {};
  const helmChartMap: HelmChartMapType = {};
  const helmValuesMap: HelmValuesMapType = {};
  const helmTemplatesMap: HelmTemplatesMapType = {};

  if (!rootFolder) {
    return {
      projectConfig,
      fileMap,
      resourceMap,
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
        readFiles(rootFolder, projectConfig, resourceMap, fileMap, helmChartMap, helmValuesMap, helmTemplatesMap)
      );
    });
  });
  const files = await readFilesPromise;

  rootEntry.children = files;

  const policyPlugins = thunkAPI.getState().main.policies.plugins;
  processKustomizations(resourceMap, fileMap);
  processResources(getK8sVersion(projectConfig), String(userDataDir), resourceMap, resourceRefsProcessingOptions, {
    policyPlugins,
  });

  monitorRootFolder(rootFolder, thunkAPI.dispatch);

  const generatedAlert = {
    title: 'Folder Import',
    message: `${Object.values(resourceMap).length} resources found in ${
      Object.values(fileMap).filter(f => !f.children).length
    } files`,
    type: AlertEnum.Success,
  };

  trackEvent(OPEN_EXISTING_PROJECT, {
    numberOfFiles: Object.values(fileMap).filter(f => !f.children).length,
    numberOfResources: Object.values(resourceMap).length,
  });

  const isFolderGitRepo = await promiseFromIpcRenderer<boolean>(
    'git.isFolderGitRepo',
    'git.isFolderGitRepo.result',
    rootFolder
  );
  const gitRepo = isFolderGitRepo
    ? await promiseFromIpcRenderer<GitRepo>('git.fetchGitRepo', 'git.fetchGitRepo.result', rootFolder)
    : undefined;

  return {
    projectConfig,
    fileMap,
    resourceMap,
    helmChartMap,
    helmValuesMap,
    helmTemplatesMap,
    isScanExcludesUpdated: 'applied',
    isScanIncludesUpdated: 'applied',
    alert: rootFolder ? generatedAlert : undefined,
    gitRepo,
  };
});
