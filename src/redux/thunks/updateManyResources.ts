import {createAsyncThunk, createNextState, original} from '@reduxjs/toolkit';

import log from 'loglevel';

import {RootState} from '@models/rootstate';

import {UpdateManyResourcesPayload, getActiveResourceMap, performResourceContentUpdate} from '@redux/reducers/main';
import {currentConfigSelector} from '@redux/selectors';
import {getK8sVersion} from '@redux/services/projectConfig';
import {reprocessResources} from '@redux/services/resource';
import {findResourcesToReprocess} from '@redux/services/resourceRefs';

export const updateManyResources = createAsyncThunk(
  'main/updateManyResources',
  async (payload: UpdateManyResourcesPayload, thunkAPI: {getState: Function; dispatch: Function}) => {
    const state: RootState = thunkAPI.getState();
    const projectConfig = currentConfigSelector(state);
    const schemaVersion = getK8sVersion(projectConfig);
    const userDataDir = String(state.config.userDataDir);

    const nextMainState = createNextState(state.main, mainState => {
      try {
        let resourceIdsToReprocess: string[] = [];
        const activeResources = getActiveResourceMap(mainState);

        payload.forEach(({resourceId, content}) => {
          const resource = activeResources[resourceId];
          if (resource) {
            performResourceContentUpdate(resource, content, mainState.fileMap, mainState.resourceMap);
            let resourceIds = findResourcesToReprocess(resource, mainState.resourceMap);
            resourceIdsToReprocess = [...new Set(resourceIdsToReprocess.concat(...resourceIds))];
          }
        });
        reprocessResources(
          schemaVersion,
          userDataDir,
          resourceIdsToReprocess,
          activeResources,
          mainState.fileMap,
          mainState.resourceRefsProcessingOptions
        );

        // relaod cluster diff if that's where we are
        if (state.ui.isClusterDiffVisible) {
          mainState.clusterDiff.shouldReload = true;
        }
      } catch (e) {
        log.error(e);
        return original(mainState);
      }
    });

    return nextMainState;
  }
);
