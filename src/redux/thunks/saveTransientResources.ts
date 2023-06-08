import {createAsyncThunk} from '@reduxjs/toolkit';

import {fileIsExcluded} from '@redux/services/fileEntry';

import {AppDispatch} from '@shared/models/appDispatch';
import {K8sResource} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';

import {SaveResourceToFileFolderPayload, saveResourceToFileFolder} from './saveResourceToFileFolder';
import {createRejectionWithAlert} from './utils';

const ERROR_TITLE = 'Resource Save Failed';

type ResourcePayload = {
  resourceId: string;
  resourceFilePath: string;
  resourceRange?: {start: number; length: number};
  fileTimestamp: number | undefined;
  isExcluded: boolean;
};

type SaveMultipleTransientResourcesPayload = {resourcePayloads: ResourcePayload[]};
type SaveMultipleTransientResourcesArgs = {
  resourcePayloads: {resource: K8sResource; absolutePath: string}[];
  saveMode: 'saveToFolder' | 'appendToFile';
};

export const saveTransientResources = createAsyncThunk<
  SaveMultipleTransientResourcesPayload,
  SaveMultipleTransientResourcesArgs,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/saveTransientResources', async (args, thunkAPI) => {
  let resourcePayloads: ResourcePayload[] = [];

  for (let i = 0; i < args.resourcePayloads.length; i += 1) {
    const {resource, absolutePath} = args.resourcePayloads[i];

    try {
      const {resourceRange, fileTimestamp} = (
        await thunkAPI.dispatch(saveResourceToFileFolder({resource, absolutePath, saveMode: args.saveMode}))
      ).payload as SaveResourceToFileFolderPayload;

      resourcePayloads.push({
        resourceId: resource.id,
        resourceFilePath: absolutePath,
        resourceRange,
        fileTimestamp,
        isExcluded: Boolean(fileIsExcluded(absolutePath, thunkAPI.getState().config.projectConfig || {})),
      });
    } catch (e) {
      if (e instanceof Error) {
        return createRejectionWithAlert(thunkAPI, ERROR_TITLE, e.message);
      }
    }
  }

  return {resourcePayloads};
});
