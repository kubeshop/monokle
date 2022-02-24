import {createAsyncThunk, original} from '@reduxjs/toolkit';

import log from 'loglevel';

import {PREDEFINED_K8S_VERSION} from '@constants/constants';

import {RootState} from '@models/rootstate';

import {UpdateManyResourcesPayload, getActiveResourceMap, performResourceContentUpdate} from '@redux/reducers/main';
import {currentConfigSelector} from '@redux/selectors';
import {reprocessResources} from '@redux/services/resource';
import {findResourcesToReprocess} from '@redux/services/resourceRefs';

export const updateManyResources = createAsyncThunk(
  'main/updateManyResources',
  async (payload: UpdateManyResourcesPayload, thunkAPI: {getState: Function; dispatch: Function}) => {
    const state: RootState = thunkAPI.getState();
    const projectConfig = currentConfigSelector(state);
    const schemaVersion = projectConfig.k8sVersion || PREDEFINED_K8S_VERSION;
    const userDataDir = String(state.config.userDataDir);

    try {
      let resourceIdsToReprocess: string[] = [];
      const activeResources = getActiveResourceMap(state.main);

      payload.forEach(({resourceId, content}) => {
        const resource = activeResources[resourceId];
        if (resource) {
          performResourceContentUpdate(resource, content, state.main.fileMap, state.main.resourceMap);
          let resourceIds = findResourcesToReprocess(resource, state.main.resourceMap);
          resourceIdsToReprocess = [...new Set(resourceIdsToReprocess.concat(...resourceIds))];
        }
      });
      reprocessResources(
        schemaVersion,
        userDataDir,
        resourceIdsToReprocess,
        activeResources,
        state.main.fileMap,
        state.main.resourceRefsProcessingOptions
      );
    } catch (e) {
      log.error(e);
      return original(state);
    }
  }
);
