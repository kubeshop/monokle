import {createAsyncThunk, createNextState} from '@reduxjs/toolkit';

import log from 'loglevel';

import {performResourceContentUpdate} from '@redux/reducers/main';
import {selectResourceReducer} from '@redux/reducers/main/selectionReducers';
import {getResourceFromState} from '@redux/selectors/resourceGetters';
import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';
import {getLineChanged} from '@redux/services/manifest-utils';

import {AppState} from '@shared/models/appState';
import {ResourceIdentifier} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';
import {ThunkApi} from '@shared/models/thunk';

type UpdateResourcePayload = {
  resourceIdentifier: ResourceIdentifier;
  text: string;
  preventSelectionAndHighlightsUpdate?: boolean;
  isUpdateFromForm?: boolean;
};

export const updateResource = createAsyncThunk<
  {nextMainState: AppState; affectedResourceIdentifiers?: ResourceIdentifier[]},
  UpdateResourcePayload,
  ThunkApi
>('main/updateResource', async (payload, thunkAPI) => {
  const state: RootState = thunkAPI.getState();

  const {resourceIdentifier, text, preventSelectionAndHighlightsUpdate, isUpdateFromForm} = payload;

  let error: any;

  const nextMainState = createNextState(state.main, mainState => {
    try {
      const resource = getResourceFromState(state, resourceIdentifier);

      const fileMap = mainState.fileMap;

      if (!resource) {
        log.warn('Failed to find updated resource.', resourceIdentifier.id, resourceIdentifier.storage);
        return;
      }

      // check if this was a kustomization resource updated during a kustomize preview
      if (
        (isKustomizationResource(resource) || isKustomizationPatch(resource)) &&
        mainState.preview?.type === 'kustomize' &&
        mainState.preview.kustomizationId === resource.id
      ) {
        performResourceContentUpdate(resource, text, fileMap);
      } else {
        const prevContent = resource.text;
        const newContent = text;
        if (isUpdateFromForm) {
          const lineChanged = getLineChanged(prevContent, newContent);
          mainState.lastChangedLine = lineChanged;
        }

        performResourceContentUpdate(resource, text, fileMap);

        if (!preventSelectionAndHighlightsUpdate) {
          selectResourceReducer(mainState, {resourceIdentifier: resource});
        }
      }

      if (state.main.autosaving.status) {
        mainState.autosaving.status = false;
      }
    } catch (e: any) {
      const {message, stack} = e || {};
      error = {message, stack};
      log.error(e);
    }
  });

  if (error) {
    return {nextMainState: {...state.main, autosaving: {status: false, error}}};
  }

  return {nextMainState, affectedResourceIdentifiers: [resourceIdentifier]};
});
