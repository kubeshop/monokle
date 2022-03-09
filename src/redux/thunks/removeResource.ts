import {createAsyncThunk, original} from '@reduxjs/toolkit';

import log from 'loglevel';

import {AppState} from '@models/appstate';

import {deleteResource, isFileResource, isUnsavedResource, removeResourceFromFile} from '@redux/services/resource';
import {updateReferringRefsOnDelete} from '@redux/services/resourceRefs';
import {clearResourceSelections} from '@redux/services/selection';

import {createKubeClient} from '@utils/kubeclient';

import {getResourceKindHandler} from '@src/kindhandlers';

export const removeResource = createAsyncThunk(
  'main/removeResource',
  async (resourceId: string, thunkAPI: {getState: Function; dispatch: Function}) => {
    const state: AppState = thunkAPI.getState().main;

    const resource = state.resourceMap[resourceId];
    if (!resource) {
      return;
    }

    updateReferringRefsOnDelete(resource, state.resourceMap);

    if (state.selectedResourceId === resourceId) {
      clearResourceSelections(state.resourceMap);
      state.selectedResourceId = undefined;
    }
    if (isUnsavedResource(resource)) {
      deleteResource(resource, state.resourceMap);
      return;
    }
    if (isFileResource(resource)) {
      removeResourceFromFile(resource, state.fileMap, state.resourceMap);
      return;
    }
    if (state.previewType === 'cluster' && state.previewKubeConfigPath && state.previewKubeConfigContext) {
      try {
        const kubeClient = createKubeClient(state.previewKubeConfigPath, state.previewKubeConfigContext);

        const kindHandler = getResourceKindHandler(resource.kind);
        if (kindHandler?.deleteResourceInCluster) {
          kindHandler.deleteResourceInCluster(kubeClient, resource);
          deleteResource(resource, state.resourceMap);
        }
      } catch (err) {
        log.error(err);
        return original(state);
      }
    }
  }
);
