import {createAsyncThunk} from '@reduxjs/toolkit';
import {SetRootFolderPayload} from '@redux/reducers/main';
import {AppDispatch, RootState} from '@redux/store';
import {FileMapType, HelmChartMapType, HelmValuesMapType, ResourceMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';
import {createFileEntry, readFiles} from '@redux/services/fileEntry';
import {ROOT_FILE_ENTRY} from '@src/constants';
import {processKustomizations} from '@redux/services/kustomize';
import {clearParsedDocs, processParsedResources} from '@redux/services/resource';
import {monitorRootFolder} from '@redux/services/fileMonitor';
import {AlertEnum} from '@models/alert';

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
  const resourceMap: ResourceMapType = {};
  const fileMap: FileMapType = {};
  const rootEntry: FileEntry = createFileEntry(rootFolder);
  const helmChartMap: HelmChartMapType = {};
  const helmValuesMap: HelmValuesMapType = {};

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
  processParsedResources(resourceMap);

  monitorRootFolder(rootFolder, appConfig, thunkAPI.dispatch);

  return {
    appConfig,
    fileMap,
    resourceMap: clearParsedDocs(resourceMap),
    helmChartMap,
    helmValuesMap,
    alert: {
      title: 'Folder Import',
      message: `${Object.values(resourceMap).length} resources found in ${Object.values(fileMap).length} files`,
      type: AlertEnum.Success,
    },
  };
});
