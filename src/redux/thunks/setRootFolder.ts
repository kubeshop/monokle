import {configSlice} from '@redux/reducers/appConfig';
import {SetRootFolderPayload} from '@redux/reducers/main';
import {createFileEntry, readFiles} from '@redux/services/fileEntry';
import {monitorRootFolder} from '@redux/services/fileMonitor';
import {processKustomizations} from '@redux/services/kustomize';
import {processParsedResources} from '@redux/services/resource';
import {AppDispatch, RootState} from '@redux/store';
import {createAsyncThunk} from '@reduxjs/toolkit';

import {AlertEnum} from '@models/alert';
import {FileMapType, HelmChartMapType, HelmValuesMapType, ResourceMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import electronStore from '@utils/electronStore';
import {getFileStats} from '@utils/files';

/**
 * Thunk to set the specified root folder
 */

export const setRootFolder = createAsyncThunk<
  SetRootFolderPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/setRootFolder', async (rootFolder, thunkAPI) => {
  const appConfig = thunkAPI.getState().config;
  const resourceRefsProcessingOptions = thunkAPI.getState().main.resourceRefsProcessingOptions;
  const resourceMap: ResourceMapType = {};
  const fileMap: FileMapType = {};
  const rootEntry: FileEntry = createFileEntry(rootFolder);
  const helmChartMap: HelmChartMapType = {};
  const helmValuesMap: HelmValuesMapType = {};

  //  console.log(`setting root folder from process type ${process?.type}`);

  fileMap[ROOT_FILE_ENTRY] = rootEntry;

  // this Promise is needed for `setRootFolder.pending` action to be dispatched correctly
  const readFilesPromise = new Promise<string[]>(resolve => {
    process.nextTick(() => {
      resolve(readFiles(rootFolder, appConfig, resourceMap, fileMap, helmChartMap, helmValuesMap));
    });
  });
  const files = await readFilesPromise;

  rootEntry.children = files;

  processKustomizations(resourceMap, fileMap);
  processParsedResources(resourceMap, resourceRefsProcessingOptions);

  monitorRootFolder(rootFolder, appConfig, thunkAPI.dispatch);
  updateRecentFolders(thunkAPI, rootFolder);

  return {
    appConfig,
    fileMap,
    resourceMap,
    helmChartMap,
    helmValuesMap,
    alert: {
      title: 'Folder Import',
      message: `${Object.values(resourceMap).length} resources found in ${
        Object.values(fileMap).filter(f => !f.children).length
      } files`,
      type: AlertEnum.Success,
    },
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
