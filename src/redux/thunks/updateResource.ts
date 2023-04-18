import {createAsyncThunk, createNextState} from '@reduxjs/toolkit';

import log from 'loglevel';

import {performResourceContentUpdate} from '@redux/reducers/main';
import {clearSelectionReducer, selectFileReducer, selectResourceReducer} from '@redux/reducers/main/selectionReducers';
import {
  getResourceContentFromState,
  getResourceFromState,
  getResourceMetaFromState,
} from '@redux/selectors/resourceGetters';
import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';
import {getLineChanged} from '@redux/services/manifest-utils';
import {extractResourceMeta, isSupportedResource} from '@redux/services/resource';

import {AppState} from '@shared/models/appState';
import {ResourceIdentifier} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';
import {ThunkApi} from '@shared/models/thunk';
import {isEqual} from '@shared/utils/isEqual';

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

  const {resourceIdentifier, text: updatedText, preventSelectionAndHighlightsUpdate, isUpdateFromForm} = payload;

  let error: any;

  const nextMainState = createNextState(state.main, mainState => {
    try {
      const nonMutableResource = getResourceFromState(state, resourceIdentifier);
      const resourceMeta = getResourceMetaFromState(state, resourceIdentifier);
      const resourceContent = getResourceContentFromState(state, resourceIdentifier);
      const fileMap = mainState.fileMap;

      let finalText: string | undefined;
      let finalObject: any | undefined;

      if (!nonMutableResource || !resourceMeta || !resourceContent) {
        log.warn('Failed to find updated resource.', resourceIdentifier.id, resourceIdentifier.storage);
        return;
      }

      // check if this was a kustomization resource updated during a kustomize preview
      if (
        (isKustomizationResource(resourceMeta) || isKustomizationPatch(resourceMeta)) &&
        mainState.preview?.type === 'kustomize' &&
        mainState.preview.kustomizationId === resourceMeta.id
      ) {
        const {text, object} = performResourceContentUpdate(nonMutableResource, updatedText, fileMap);
        finalText = text;
        finalObject = object;
      } else {
        const prevContent = resourceContent.text;
        const newContent = updatedText;
        if (isUpdateFromForm) {
          const lineChanged = getLineChanged(prevContent, newContent);
          mainState.lastChangedLine = lineChanged;
        }

        const {text, object} = performResourceContentUpdate(nonMutableResource, updatedText, fileMap);
        finalText = text;
        finalObject = object;
      }

      if (!preventSelectionAndHighlightsUpdate) {
        selectResourceReducer(mainState, {resourceIdentifier: resourceMeta});
      }

      if (finalText && finalObject) {
        const updatedResourceMeta = extractResourceMeta(
          finalObject,
          resourceMeta.storage,
          resourceMeta.origin,
          resourceMeta.id
        );

        // did the change invalidate the resource?
        if (!isSupportedResource(updatedResourceMeta)) {
          delete mainState.resourceMetaMapByStorage[resourceMeta.storage][resourceMeta.id];
          delete mainState.resourceContentMapByStorage[resourceMeta.storage][resourceMeta.id];
          if (updatedResourceMeta.storage === 'local') {
            // @ts-ignore
            selectFileReducer(mainState, {filePath: updatedResourceMeta.origin.filePath});
          } else {
            clearSelectionReducer(mainState);
          }
        } else {
          if (!isEqual(resourceMeta, updatedResourceMeta)) {
            // @ts-ignore-next-line
            mainState.resourceMetaMapByStorage[resourceMeta.storage][resourceMeta.id] = updatedResourceMeta;
          }
          if (resourceContent.text !== finalText) {
            mainState.resourceContentMapByStorage[resourceMeta.storage][resourceMeta.id].text = finalText;
          }
          if (!isEqual(resourceContent.object, finalObject)) {
            mainState.resourceContentMapByStorage[resourceMeta.storage][resourceMeta.id].object = finalObject;
          }
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
