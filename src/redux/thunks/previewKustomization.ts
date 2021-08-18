import {ipcRenderer} from 'electron';
import {createAsyncThunk} from '@reduxjs/toolkit';
import {SetPreviewDataPayload} from '@redux/reducers/main';
import {AppDispatch, RootState} from '@redux/store';
import path from 'path';
import log from 'loglevel';
import {createPreviewRejection, createPreviewResult} from '@redux/thunks/utils';

/**
 * Thunk to preview kustomizations
 */

export const previewKustomization = createAsyncThunk<
  SetPreviewDataPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/previewKustomization', async (resourceId, thunkAPI) => {
  const state = thunkAPI.getState().main;
  if (state.previewResourceId !== resourceId) {
    const resource = state.resourceMap[resourceId];
    if (resource && resource.fileRelPath) {
      const rootEntry = state.rootEntry;
      if (!rootEntry) {
        return createPreviewRejection(thunkAPI, 'Kustomize Error', 'Could not find root folder');
      }
      const folder = path.join(
        rootEntry.absPath,
        resource.fileRelPath.substr(0, resource.fileRelPath.lastIndexOf(path.sep))
      );

      log.info(`previewing ${resource.id} in folder ${folder}`);
      const result = await runKustomize(folder);

      if (result.error) {
        return createPreviewRejection(thunkAPI, 'Kustomize Error', result.error);
      }

      if (result.stdout) {
        return createPreviewResult(result.stdout, resource.id, 'Kustomize Preview');
      }
    }
  }

  return {};
});

/**
 * Invokes kustomize in main thread
 */

function runKustomize(cmd: any): any {
  return new Promise(resolve => {
    ipcRenderer.once('kustomize-result', (event, arg) => {
      resolve(arg);
    });
    ipcRenderer.send('run-kustomize', cmd);
  });
}
