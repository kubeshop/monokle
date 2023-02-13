import {Draft, PayloadAction} from '@reduxjs/toolkit';

import {highlightResourcesFromFile} from '@redux/services/fileEntry';

import {AppState} from '@shared/models/appState';
import {ImageType} from '@shared/models/image';
import {ResourceIdentifier} from '@shared/models/k8sResource';
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

export const selectResourceReducer = (
  state: AppState,
  payload: {resourceIdentifier: ResourceIdentifier; isVirtualSelection?: boolean}
) => {
  const identifier = payload.resourceIdentifier;
  const resourceMetaMap = state.resourceMetaMapByStorage[identifier.storage];
  const resource = resourceMetaMap[identifier.id];

  if (!resource) {
    return;
  }
  state.lastChangedLine = 0;

  state.selection = {
    type: 'resource',
    resourceIdentifier: {
      id: resource.id,
      storage: resource.storage,
    },
  };

  const newHighlights: AppSelection[] = [];

  resource.refs?.forEach(ref => {
    if (ref.target?.type === 'resource' && ref.target.resourceId) {
      newHighlights.push({
        type: 'resource',
        resourceIdentifier: {
          id: ref.target.resourceId,
          storage: resource.storage,
        },
      });
    }
    if (ref.target?.type === 'file' && ref.target.filePath) {
      newHighlights.push({
        type: 'file',
        filePath: ref.target.filePath,
      });
    }
    if (ref.target?.type === 'image' && ref.target.tag) {
      newHighlights.push({
        type: 'image',
        imageId: ref.target.tag,
      });
    }
  });

  if (resource.storage === 'local') {
    newHighlights.push({
      type: 'file',
      filePath: resource.origin.filePath,
    });
  }

  state.highlights = newHighlights;

  // TODO: highlight resources from resource.refs

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
  selectResource: (
    state: Draft<AppState>,
    action: PayloadAction<{
      resourceIdentifier: ResourceIdentifier;
      isVirtualSelection?: boolean;
    }>
  ) => {
    selectResourceReducer(state, action.payload);
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
    state.highlights = [];
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
    state.highlights = [];
    updateSelectionHistory(state.selection, Boolean(action.payload.isVirtualSelection), state);
  },
  selectImage: (state: Draft<AppState>, action: PayloadAction<{imageId: string; isVirtualSelection?: boolean}>) => {
    state.selection = {
      type: 'image',
      imageId: action.payload.imageId,
    };
    state.highlights = [];
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
      resourceIdentifier: {
        id: resourceId,
        storage: 'local', // TODO: images will have to identify resources using identifiers
      },
    });
  });

  state.highlights = highlights;
}

export const clearSelectedResourceOnPreviewExit = (state: AppState) => {
  if (state.selection?.type === 'resource' && state.selection.resourceIdentifier.storage === 'preview') {
    state.selection = undefined;
  }
};
