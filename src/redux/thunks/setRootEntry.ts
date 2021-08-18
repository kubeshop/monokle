import {createAsyncThunk} from '@reduxjs/toolkit';
import {SetRootEntryPayload} from '@redux/reducers/main';
import {AppDispatch, RootState} from '@redux/store';
import {HelmChartMapType, HelmValuesMapType, ResourceMapType} from '@models/appstate';
import {RootEntry, FileSystemEntryMap} from '@models/filesystementry';
import {readFilesFromFolder, getNameFromFilePath} from '@redux/services/fileSystemEntry';
import {processKustomizations} from '@redux/services/kustomize';
import {clearParsedDocs, processParsedResources} from '@redux/services/resource';
import {monitorRootFolder} from '@redux/services/fileMonitor';
import {AlertEnum} from '@models/alert';

/**
 * Thunk to set the specified root folder
 */

export const setRootEntry = createAsyncThunk<
  SetRootEntryPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/setRootEntry', async (rootFolderAbsPath, thunkAPI) => {
  const appConfig = thunkAPI.getState().config;
  const resourceMap: ResourceMapType = {};
  const fsEntryMap: FileSystemEntryMap = {};
  const rootEntry: RootEntry = {
    type: 'root',
    name: getNameFromFilePath(rootFolderAbsPath),
    absPath: rootFolderAbsPath,
    childrenEntryNames: [],
  };
  const helmChartMap: HelmChartMapType = {};
  const helmValuesMap: HelmValuesMapType = {};

  // this Promise is needed for `setRootEntry.pending` action to be dispatched correctly
  const readFilesPromise = new Promise<string[]>(resolve => {
    process.nextTick(() => {
      resolve(
        readFilesFromFolder(
          rootEntry.absPath,
          rootEntry,
          appConfig,
          resourceMap,
          fsEntryMap,
          helmChartMap,
          helmValuesMap
        )
      );
    });
  });
  rootEntry.childrenEntryNames = await readFilesPromise;

  processKustomizations(resourceMap, fsEntryMap);
  processParsedResources(resourceMap);

  monitorRootFolder(rootEntry.absPath, appConfig, thunkAPI.dispatch);

  return {
    appConfig,
    rootEntry,
    fsEntryMap,
    resourceMap: clearParsedDocs(resourceMap),
    helmChartMap,
    helmValuesMap,
    alert: {
      title: 'Folder Import',
      message: `${Object.values(resourceMap).length} resources found in ${Object.values(fsEntryMap).length} files`,
      type: AlertEnum.Success,
    },
  };
});
