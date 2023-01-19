import {createAsyncThunk, createNextState, original} from '@reduxjs/toolkit';

import log from 'loglevel';

import {UpdateMultipleResourcesPayload, performResourceContentUpdate} from '@redux/reducers/main';
import {activeResourceMapSelector} from '@redux/selectors';

import {RootState} from '@shared/models/rootState';

// TODO: this might not have to be a thunk after removing the reprocessing logic
export const updateMultipleResources = createAsyncThunk(
  'main/updateMultipleResources',
  async (payload: UpdateMultipleResourcesPayload, thunkAPI: {getState: Function; dispatch: Function}) => {
    const state: RootState = thunkAPI.getState();

    const nextMainState = createNextState(state.main, mainState => {
      try {
        // let resourceIdsToReprocess: string[] = [];
        // const activeResources = getActiveResourceMap(mainState);
        const activeResourceMap = activeResourceMapSelector(mainState);

        // TODO: reimplement getActiveResourceMap...

        payload.forEach(({resourceId, content}) => {
          const resource = activeResourceMap[resourceId];
          if (resource) {
            performResourceContentUpdate(resource, content, mainState.fileMap);
            // let resourceIds = findResourcesToReprocess(resource, mainState.resourceMap);
            // resourceIdsToReprocess = [...new Set(resourceIdsToReprocess.concat(...resourceIds))];
          }
        });
        // TODO: reprocessing will happen in the validation listener after we add @monokle/validation
        // reprocessResources(
        //   schemaVersion,
        //   userDataDir,
        //   resourceIdsToReprocess,
        //   activeResources,
        //   mainState.fileMap,
        //   mainState.resourceRefsProcessingOptions,
        //   {policyPlugins: mainState.policies.plugins}
        // );
      } catch (e) {
        log.error(e);
        return original(mainState);
      }
    });

    return nextMainState;
  }
);
