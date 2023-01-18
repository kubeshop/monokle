import {Draft, PayloadAction} from '@reduxjs/toolkit';

import {highlightResourcesFromFile} from '@redux/services/fileEntry';

import {AppState} from '@shared/models/appState';
import {ImageType} from '@shared/models/image';
import {ResourceStorageKey} from '@shared/models/k8sResource';
import {AppSelection} from '@shared/models/selection';
import {createSliceReducers} from '@shared/utils/redux';

export const selectFileReducer = (state: AppState, payload: {filePath: string; isVirtualSelection?: boolean}) => {
  const filePath = payload.filePath;
  if (filePath.length > 0) {
    highlightResourcesFromFile({filePath, state});

    state.selection = {
      type: 'file',
      filePath,
    };

    updateSelectionHistory(state.selection, Boolean(payload.isVirtualSelection), state);
  }
};

export const selectK8sResourceReducer = (
  state: AppState,
  payload: {resourceId: string; resourceStorage: ResourceStorageKey; isVirtualSelection?: boolean}
) => {
  const storage = payload.resourceStorage;
  const resource = state.resourceMetaStorage[storage][payload.resourceId];

  if (!resource) {
    return;
  }
  state.lastChangedLine = 0;

  state.selection = {
    type: 'resource',
    resourceId: resource.id,
    resourceStorage: storage,
  };

  updateSelectionHistory(state.selection, Boolean(payload.isVirtualSelection), state);
};

export const clearSelectionReducer = (state: AppState) => {
  state.selection = undefined;
  state.selectionOptions = {};
  state.highlights = [];
};

export const selectionReducers = createSliceReducers('main', {
  /**
   * Marks the specified resource as selected and highlights all related resources
   */
  selectK8sResource: (
    state: Draft<AppState>,
    action: PayloadAction<{
      resourceId: string;
      resourceStorage: ResourceStorageKey;
      isVirtualSelection?: boolean;
    }>
  ) => {
    selectK8sResourceReducer(state, action.payload);
  },
  /**
   * Marks the specified file as selected and highlights all related resources
   */
  selectFile: (state: Draft<AppState>, action: PayloadAction<{filePath: string; isVirtualSelection?: boolean}>) => {
    selectFileReducer(state, action.payload);
  },
  /**
   * Marks the specified values as selected
   */
  selectHelmValuesFile: (
    state: Draft<AppState>,
    action: PayloadAction<{valuesFileId: string; isVirtualSelection?: boolean}>
  ) => {
    const valuesFileId = action.payload.valuesFileId;
    state.selection = {
      type: 'helm.values.file',
      valuesFileId,
    };
    updateSelectionHistory(state.selection, Boolean(action.payload.isVirtualSelection), state);
  },
  selectPreviewConfiguration: (
    state: Draft<AppState>,
    action: PayloadAction<{previewConfigurationId: string; isVirtualSelection?: boolean}>
  ) => {
    const previewConfigurationId = action.payload.previewConfigurationId;
    state.selection = {
      type: 'preview.configuration',
      previewConfigurationId,
    };
    updateSelectionHistory(state.selection, Boolean(action.payload.isVirtualSelection), state);
  },
  selectImage: (state: Draft<AppState>, action: PayloadAction<{imageId: string; isVirtualSelection?: boolean}>) => {
    state.selection = {
      type: 'image',
      imageId: action.payload.imageId,
    };
    // TODO: fix highlighting of resources from image
    // highlightResourcesUsingImage(action.payload.image, state);
    updateSelectionHistory(state.selection, Boolean(action.payload.isVirtualSelection), state);
  },
  clearSelection: (state: Draft<AppState>) => {
    clearSelectionReducer(state);
  },
});

function clearSelectionAndHighlights(state: AppState) {
  state.selection = undefined;
  state.selectionOptions = {};
  state.highlights = [];
}

function updateSelectionHistory(selection: AppSelection, isVirtualSelection: boolean, state: AppState) {
  if (isVirtualSelection) {
    return;
  }

  state.selectionHistory.current.push(selection);
  state.selectionHistory.index = undefined;
}

export function highlightResourcesUsingImage(image: ImageType, state: AppState) {
  clearSelectionAndHighlights(state);

  const highlights: AppSelection[] = [];

  image.resourcesIds.forEach(resourceId => {
    highlights.push({
      type: 'resource',
      resourceId,
      resourceStorage: 'local', // TODO: images will have to store the resource storage as well
    });
  });

  state.highlights = highlights;
}

export const clearSelectedResourceOnPreviewExit = (state: AppState) => {
  if (state.selection?.type === 'resource' && state.selection.resourceStorage === 'preview') {
    state.selection = undefined;
  }
};
