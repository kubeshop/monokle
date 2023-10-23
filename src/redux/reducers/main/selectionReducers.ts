import {Draft, PayloadAction} from '@reduxjs/toolkit';

import {highlightResourcesFromFile} from '@redux/services/fileEntry';

import {AppState} from '@shared/models/appState';
import {ImageType} from '@shared/models/image';
import {ResourceIdentifier, ResourceMeta, ResourceStorage, isLocalResourceMeta} from '@shared/models/k8sResource';
import {AppSelection} from '@shared/models/selection';
import {createSliceReducers} from '@shared/utils/redux';

export const selectFileReducer = (state: AppState, payload: {filePath: string; isVirtualSelection?: boolean}) => {
  clearSelectionAndHighlights(state);

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

export const createResourceHighlights = (resourceMeta: ResourceMeta): AppSelection[] => {
  const newHighlights: AppSelection[] = [];

  resourceMeta.refs?.forEach(ref => {
    if (ref.target?.type === 'resource' && ref.target.resourceId) {
      newHighlights.push({
        type: 'resource',
        resourceIdentifier: {
          id: ref.target.resourceId,
          storage: resourceMeta.storage,
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
        imageId: `${ref.name}:${ref.target.tag}`,
      });
    }
  });

  if (isLocalResourceMeta(resourceMeta)) {
    newHighlights.push({
      type: 'file',
      filePath: resourceMeta.origin.filePath,
    });
  }

  return newHighlights;
};

export const selectResourceReducer = (
  state: AppState,
  payload: {resourceIdentifier: ResourceIdentifier; isVirtualSelection?: boolean}
) => {
  clearSelectionAndHighlights(state);

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

  state.highlights = createResourceHighlights(resource);

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
    clearSelectionAndHighlights(state);
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
    clearSelectionAndHighlights(state);
    const previewConfigurationId = action.payload.previewConfigurationId;
    state.selection = {
      type: 'preview.configuration',
      previewConfigurationId,
    };
    updateSelectionHistory(state.selection, Boolean(action.payload.isVirtualSelection), state);
  },
  selectImage: (state: Draft<AppState>, action: PayloadAction<{imageId: string; isVirtualSelection?: boolean}>) => {
    clearSelectionAndHighlights(state);
    state.selection = {
      type: 'image',
      imageId: action.payload.imageId,
    };
    const image = state.imageMap[action.payload.imageId];
    if (image) {
      highlightResourcesUsingImage(image, state);
    }
    updateSelectionHistory(state.selection, Boolean(action.payload.isVirtualSelection), state);
  },
  // TODO: implement logic for selecting commands, we have to update the editor to show a new panel displaying the command
  // selectCommand: (state: Draft<AppState>, action: PayloadAction<{commandId: string}>) => {
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
  const highlights: AppSelection[] = [];

  // TODO: 2.0+ below is a quick solution to get the active resource storage
  // since images are filtered by the current active resource storage, this should be fine for now
  let activeStorage: ResourceStorage = 'local';
  if (state.clusterConnection) {
    activeStorage = 'cluster';
  }
  if (state.preview) {
    activeStorage = 'preview';
  }

  image.resourcesIds.forEach(resourceId => {
    highlights.push({
      type: 'resource',
      resourceIdentifier: {
        id: resourceId,
        storage: activeStorage,
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
