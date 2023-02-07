import {createAsyncThunk, createNextState, original} from '@reduxjs/toolkit';

import log from 'loglevel';

import {UpdateMultipleResourcesPayload, performResourceContentUpdate} from '@redux/reducers/main';
import {resourceSelector} from '@redux/selectors/resourceSelectors';

import {AppState} from '@shared/models/appState';
import {ResourceIdentifier} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';

export const updateMultipleResources = createAsyncThunk<
  {nextMainState: AppState; affectedResourceIdentifiers?: ResourceIdentifier[]},
  UpdateMultipleResourcesPayload
>('main/updateMultipleResources', async (payload, thunkAPI: {getState: Function; dispatch: Function}) => {
  const state: RootState = thunkAPI.getState();

  const nextMainState = createNextState(state.main, mainState => {
    try {
      payload.forEach(({resourceIdentifier, content}) => {
        const resource = resourceSelector(state, resourceIdentifier);

        if (resource) {
          performResourceContentUpdate(resource, content, mainState.fileMap);
        }
      });
    } catch (e) {
      log.error(e);
      return original(mainState);
    }
  });

  return {nextMainState, affectedResourceIdentifiers: payload.map(({resourceIdentifier}) => resourceIdentifier)};
});
