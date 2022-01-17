import {createAsyncThunk} from '@reduxjs/toolkit';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {AlertEnum} from '@models/alert';
import {FileMapType, HelmChartMapType, HelmValuesMapType, ResourceMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';

import {configSlice} from '@redux/reducers/appConfig';
import {SetRootFolderPayload} from '@redux/reducers/main';
import {createFileEntry, readFiles} from '@redux/services/fileEntry';
import {monitorRootFolder} from '@redux/services/fileMonitor';
import {processKustomizations} from '@redux/services/kustomize';
import {processParsedResources} from '@redux/services/resource';
import {AppDispatch, RootState} from '@redux/store';
import {createRejectionWithAlert} from '@redux/thunks/utils';

import electronStore from '@utils/electronStore';
import {getFileStats} from '@utils/files';

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
  const appConfig = thunkAPI.getState().config;
  const resourceRefsProcessingOptions = thunkAPI.getState().main.resourceRefsProcessingOptions;
  const resourceMap: ResourceMapType = {};
  const fileMap: FileMapType = {};
  const helmChartMap: HelmChartMapType = {};
  const helmValuesMap: HelmValuesMapType = {};

  if (!rootFolder) {
    return;
  }

  const stats = getFileStats(rootFolder);
  if (!stats) {
    return createRejectionWithAlert(thunkAPI, 'Missing folder', `Folder ${rootFolder} does not exist`);
  }
  if (!stats.isDirectory()) {
    return createRejectionWithAlert(thunkAPI, 'Invalid path', `Specified path ${rootFolder} is not a folder`);
  }

  const rootEntry: FileEntry = createFileEntry(rootFolder);
  fileMap[ROOT_FILE_ENTRY] = rootEntry;

  fileMap[ROOT_FILE_ENTRY] = rootEntry;

  // this Promise is needed for `setRootFolder.pending` action to be dispatched correctly
  const readFilesPromise = new Promise<string[]>(resolve => {
    setImmediate(() => {
      resolve(readFiles(rootFolder, appConfig, resourceMap, fileMap, helmChartMap, helmValuesMap));
    });
  });
  const files = await readFilesPromise;

  rootEntry.children = files;

  processKustomizations(resourceMap, fileMap);
  processParsedResources(resourceMap, resourceRefsProcessingOptions);

  monitorRootFolder(rootFolder, appConfig, thunkAPI.dispatch);
  updateRecentFolders(thunkAPI, rootFolder);

  const generatedAlert = {
    title: 'Folder Import',
    message: `${Object.values(resourceMap).length} resources found in ${
      Object.values(fileMap).filter(f => !f.children).length
    } files`,
    type: AlertEnum.Success,
  };

  return {
    appConfig,
    fileMap,
    resourceMap,
    helmChartMap,
    helmValuesMap,
    alert: rootFolder ? generatedAlert : undefined,
  };
});

/**
 * Adds the specified folder to the top of the recentFolders list
 */

function updateRecentFolders(thunkAPI: any, rootFolder: string) {
  let folders: string[] = [];
  folders = folders.concat(thunkAPI.getState().config.recentFolders);

  const ix = folders.indexOf(rootFolder);
  if (ix !== 0) {
    if (ix > 0) {
      folders.splice(ix, 1);
    }

    // remove entries that don't exist anymore
    folders = folders.filter(e => getFileStats(e)?.isDirectory());
    folders.unshift(rootFolder);

    electronStore.set('appConfig.recentFolders', folders);
    thunkAPI.dispatch(configSlice.actions.setRecentFolders(folders));
  }
}
