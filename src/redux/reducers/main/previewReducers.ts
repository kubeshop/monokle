import {Draft, PayloadAction} from '@reduxjs/toolkit';

import {splitK8sResourceMap} from '@redux/services/resource';
import {clearSelection} from '@redux/services/selection';
import {resetSelectionHistory} from '@redux/services/selectionHistory';
import {previewHelmValuesFile, previewKustomization, previewSavedCommand} from '@redux/thunks/preview';
import {runPreviewConfiguration} from '@redux/thunks/runPreviewConfiguration';

import {AppState} from '@shared/models/appState';
import {K8sResource} from '@shared/models/k8sResource';
import {AnyPreview} from '@shared/models/preview';
import {
  AppSelection,
  CommandSelection,
  HelmValuesFileSelection,
  PreviewConfigurationSelection,
  ResourceSelection,
} from '@shared/models/selection';
import {createSliceExtraReducers, createSliceReducers} from '@shared/utils/redux';

export const clearPreviewReducer = (state: Draft<AppState>) => {
  state.checkedResourceIdentifiers = [];
  state.resourceMetaMapByStorage.preview = {};
  state.resourceContentMapByStorage.preview = {};
  state.preview = undefined;
  state.previewOptions = {};
};

export const previewReducers = createSliceReducers('main', {
  clearPreview: (state: Draft<AppState>, action: PayloadAction<{type: 'restartPreview'}>) => {
    if (action.payload.type !== 'restartPreview') {
      clearSelectedResourceOnPreviewExit(state);
    }
    clearPreviewReducer(state);
    state.checkedResourceIdentifiers = [];
    state.resourceMetaMapByStorage.preview = {};
    state.resourceContentMapByStorage.preview = {};
    state.preview = undefined;
    state.previewOptions = {};
  },
  clearPreviewAndSelectionHistory: (state: Draft<AppState>) => {
    clearPreviewReducer(state);
    resetSelectionHistory(state);
    clearSelectedResourceOnPreviewExit(state);
  },
  setPreviewLoading: (state: Draft<AppState>, action: PayloadAction<boolean>) => {
    state.previewOptions.isLoading = action.payload;
  },
});

const clearSelectedResourceOnPreviewExit = (state: AppState) => {
  if (state.selection?.type === 'resource' && state.selection.resourceIdentifier.storage === 'preview') {
    clearSelection(state);
  }
};

const onPreviewPending = (state: AppState) => {
  state.previewOptions.isLoading = true;
};

export const onPreviewRejected = (state: AppState) => {
  state.previewOptions.isLoading = false;
  state.selectionHistory.current = state.selectionHistory.previous;
  state.selectionHistory.previous = [];
};

const onPreviewSuccess = <Preview extends AnyPreview = AnyPreview>(
  state: AppState,
  payload: {resources: K8sResource<'preview'>[]; preview: Preview},
  initialSelection?: AppSelection
) => {
  state.preview = payload.preview;
  state.previewOptions.isLoading = false;
  state.checkedResourceIdentifiers = [];

  const {metaMap, contentMap} = splitK8sResourceMap(payload.resources);

  state.resourceMetaMapByStorage.preview = metaMap;
  state.resourceContentMapByStorage.preview = contentMap;

  if (initialSelection) {
    state.selection = initialSelection;
    resetSelectionHistory(state, [initialSelection]);
  } else {
    resetSelectionHistory(state);
  }
};

export const previewExtraReducers = createSliceExtraReducers('main', builder => {
  builder
    .addCase(previewKustomization.pending, onPreviewPending)
    .addCase(previewKustomization.fulfilled, (state, action) => {
      const initialSelection: ResourceSelection = {
        type: 'resource',
        resourceIdentifier: {
          id: action.payload.preview.kustomizationId,
          storage: 'local',
        },
      };

      onPreviewSuccess(state, action.payload, initialSelection);
    })
    .addCase(previewKustomization.rejected, onPreviewRejected);

  builder
    .addCase(previewHelmValuesFile.pending, onPreviewPending)
    .addCase(previewHelmValuesFile.fulfilled, (state, action) => {
      const initialSelection: HelmValuesFileSelection = {
        type: 'helm.values.file',
        valuesFileId: action.payload.preview.valuesFileId,
      };
      onPreviewSuccess(state, action.payload, initialSelection);
    })
    .addCase(previewHelmValuesFile.rejected, onPreviewRejected);

  builder
    .addCase(runPreviewConfiguration.pending, onPreviewPending)
    .addCase(runPreviewConfiguration.fulfilled, (state, action) => {
      if (!action.payload) {
        return;
      }
      const initialSelection: PreviewConfigurationSelection = {
        type: 'preview.configuration',
        previewConfigurationId: action.payload.preview.configId,
      };
      onPreviewSuccess(state, action.payload, initialSelection);
    })
    .addCase(runPreviewConfiguration.rejected, onPreviewRejected);

  builder
    .addCase(previewSavedCommand.pending, onPreviewPending)
    .addCase(previewSavedCommand.fulfilled, (state, action) => {
      const initialSelection: CommandSelection = {
        type: 'command',
        commandId: action.payload.preview.commandId,
      };
      onPreviewSuccess(state, action.payload, initialSelection);
    })
    .addCase(previewSavedCommand.rejected, onPreviewRejected);
});
