import {createAsyncThunk, createNextState, original} from '@reduxjs/toolkit';

import fastDeepEqual from 'fast-deep-equal';
import log from 'loglevel';

import {UpdateMultipleResourcesPayload, performResourceContentUpdate} from '@redux/reducers/main';
import {getResourceFromState} from '@redux/selectors/resourceGetters';
import {extractResourceMeta} from '@redux/services/resource';

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
        const resource = getResourceFromState(state, resourceIdentifier);

        if (resource) {
          const {text, object} = performResourceContentUpdate(resource, content, mainState.fileMap);
          const updatedResourceMeta = extractResourceMeta(object, resource.storage, resource.origin, resource.id);
          if (!fastDeepEqual(resource, updatedResourceMeta)) {
            // @ts-ignore-next-line
            mainState.resourceMetaMapByStorage[resource.storage][resource.id] = updatedResourceMeta;
          }
          if (resource.text !== text) {
            mainState.resourceContentMapByStorage[resource.storage][resource.id].text = text;
          }
          if (!fastDeepEqual(resource.object, object)) {
            mainState.resourceContentMapByStorage[resource.storage][resource.id].object = object;
          }
        }
      });
    } catch (e) {
      log.error(e);
      return original(mainState);
    }
  });

  return {nextMainState, affectedResourceIdentifiers: payload.map(({resourceIdentifier}) => resourceIdentifier)};
});
