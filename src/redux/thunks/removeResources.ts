import {createAsyncThunk, createNextState, original} from '@reduxjs/toolkit';

import log from 'loglevel';

import {RootState} from '@models/rootstate';

import {deleteResource, isFileResource, isUnsavedResource, removeResourceFromFile} from '@redux/services/resource';
import {updateReferringRefsOnDelete} from '@redux/services/resourceRefs';
import {clearResourceSelections} from '@redux/services/selection';

import {createKubeClient} from '@utils/kubeclient';

import {getResourceKindHandler} from '@src/kindhandlers';

export const removeResources = createAsyncThunk(
  'main/removeResources',
  async (resourceIds: string[], thunkAPI: {getState: Function; dispatch: Function}) => {
    const state: RootState = thunkAPI.getState();

    const nextMainState = createNextState(state.main, mainState => {
      resourceIds.forEach(resourceId => {
        const resource = mainState.resourceMap[resourceId];
        if (!resource) {
          return;
        }

        updateReferringRefsOnDelete(resource, mainState.resourceMap);

        if (mainState.selectedResourceId === resourceId) {
          clearResourceSelections(mainState.resourceMap);
          mainState.selectedResourceId = undefined;
        }

        if (isUnsavedResource(resource)) {
          deleteResource(resource, mainState.resourceMap);
          return;
        }

        if (isFileResource(resource)) {
          removeResourceFromFile(resource, mainState.fileMap, mainState.resourceMap);
          return;
        }

        if (
          mainState.previewType === 'cluster' &&
          mainState.previewKubeConfigPath &&
          mainState.previewKubeConfigContext
        ) {
          try {
            const kubeClient = createKubeClient(mainState.previewKubeConfigPath, mainState.previewKubeConfigContext);

            const kindHandler = getResourceKindHandler(resource.kind);
            if (kindHandler?.deleteResourceInCluster) {
              kindHandler.deleteResourceInCluster(kubeClient, resource);
              deleteResource(resource, mainState.resourceMap);
            }
          } catch (err) {
            log.error(err);
            return original(mainState);
          }
        }
      });
    });

    return nextMainState;
  }
);
