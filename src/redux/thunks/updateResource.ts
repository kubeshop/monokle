import {createAsyncThunk, createNextState} from '@reduxjs/toolkit';

import log from 'loglevel';

import {performResourceContentUpdate} from '@redux/reducers/main';
import {selectResourceReducer} from '@redux/reducers/main/selectionReducers';
import {activeResourceMapSelector} from '@redux/selectors';
import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';
import {getLineChanged} from '@redux/services/manifest-utils';

import {AppState} from '@shared/models/appState';
import {RootState} from '@shared/models/rootState';
import {ThunkApi} from '@shared/models/thunk';

type UpdateResourcePayload = {
  resourceId: string;
  text: string;
  preventSelectionAndHighlightsUpdate?: boolean;
  isUpdateFromForm?: boolean;
};

export const updateResource = createAsyncThunk<AppState, UpdateResourcePayload, ThunkApi>(
  'main/updateResource',
  async (payload, thunkAPI) => {
    const state: RootState = thunkAPI.getState();

    const {resourceId, text, preventSelectionAndHighlightsUpdate, isUpdateFromForm} = payload;

    let error: any;

    const nextMainState = createNextState(state.main, mainState => {
      try {
        const activeResourceMap = activeResourceMapSelector(state);
        const resource = activeResourceMap[resourceId];

        const fileMap = mainState.fileMap;

        if (!resource) {
          log.warn('Failed to find updated resource during preview', resourceId);
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
            selectResourceReducer(mainState, {resourceId: resource.id, resourceStorage: resource.origin.storage});
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
      return {...state.main, autosaving: {status: false, error}};
    }

    return nextMainState;
  }
);
