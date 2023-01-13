import {Draft, PayloadAction} from '@reduxjs/toolkit';

import {highlightResourcesFromFile} from '@redux/services/fileEntry';

import {AppState, ImageType, ResourceStorage} from '@shared/models';
import {AppSelection} from '@shared/models/selection';
import {createSliceReducers} from '@shared/utils/redux';

export const selectionReducers = createSliceReducers('main', {
  /**
   * Marks the specified resource as selected and highlights all related resources
   */
  selectK8sResource: (
    state: Draft<AppState>,
    action: PayloadAction<{
      resourceId: string;
      resourceStorage: ResourceStorage;
      isVirtualSelection?: boolean;
    }>
  ) => {
    const storage = action.payload.resourceStorage;
    const resource = state.resourceMetaStorage[storage][action.payload.resourceId];

    if (!resource) {
      return;
    }
    state.lastChangedLine = 0;

    state.selection = {
      type: 'resource',
      resourceId: resource.id,
      resourceStorage: storage,
    };

    updateSelectionHistory(state.selection, Boolean(action.payload.isVirtualSelection), state);
  },
  /**
   * Marks the specified values as selected
   */
  selectHelmValuesFile: (
    state: Draft<AppState>,
    action: PayloadAction<{valuesFileId: string; isVirtualSelection?: boolean}>
  ) => {
    const valuesFileId = action.payload.valuesFileId;
    Object.values(state.helmValuesMap).forEach(values => {
      values.isSelected = values.id === valuesFileId;
    });

    const filePath = state.helmValuesMap[valuesFileId].filePath;

    state.selection = {
      type: 'helm.values.file',
      valuesFileId,
      filePath,
    };

    updateSelectionHistory(state.selection, Boolean(action.payload.isVirtualSelection), state);
  },
  /**
   * Marks the specified file as selected and highlights all related resources
   */
  selectFile: (state: Draft<AppState>, action: PayloadAction<{filePath: string; isVirtualSelection?: boolean}>) => {
    const filePath = action.payload.filePath;
    if (filePath.length > 0) {
      highlightResourcesFromFile({filePath, state});

      state.selection = {
        type: 'file',
        filePath,
      };

      updateSelectionHistory(state.selection, Boolean(action.payload.isVirtualSelection), state);
    }
  },
  clearSelected: (state: Draft<AppState>) => {
    state.selection = undefined;
    state.selectionOptions = {};
  },
  selectImage: (state: Draft<AppState>, action: PayloadAction<{image: ImageType; isVirtualSelection?: boolean}>) => {
    state.selection = {
      type: 'image',
      imageId: action.payload.image.id,
    };

    highlightResourcesUsingImage(action.payload.image, state);

    updateSelectionHistory(state.selection, Boolean(action.payload.isVirtualSelection), state);
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
