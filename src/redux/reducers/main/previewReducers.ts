import {previewSavedCommand} from '@redux/services/previewCommand';
import {splitK8sResourceMap} from '@redux/services/resource';
import {resetSelectionHistory} from '@redux/services/selectionHistory';
import {previewHelmValuesFile} from '@redux/thunks/previewHelmValuesFile';
import {previewKustomization} from '@redux/thunks/previewKustomization';
import {runPreviewConfiguration} from '@redux/thunks/runPreviewConfiguration';

import {AppState} from '@shared/models/appState';
import {createSliceExtraReducers} from '@shared/utils/redux';

const onPreviewPending = (state: AppState) => {
  state.previewOptions.isLoading = true;
};

export const onPreviewRejected = (state: AppState) => {
  state.previewOptions.isLoading = false;
  state.selectionHistory.current = state.selectionHistory.previous;
  state.selectionHistory.previous = [];
};

export const previewExtraReducers = createSliceExtraReducers('main', builder => {
  builder
    .addCase(previewKustomization.pending, onPreviewPending)
    .addCase(previewKustomization.fulfilled, (state, action) => {
      state.previewOptions.isLoading = false;

      const {metaMap, contentMap} = splitK8sResourceMap(action.payload.resources);

      state.resourceMetaStorage.preview = metaMap;
      state.resourceContentStorage.preview = contentMap;

      state.checkedResourceIds = [];

      state.preview = action.payload.preview;

      const initialSelection = {
        type: 'resource',
        resourceId: action.payload.preview.kustomizationId,
        resourceStorage: 'local',
      } as const;
      state.selection = initialSelection;
      resetSelectionHistory(state, [initialSelection]);
    })
    .addCase(previewKustomization.rejected, onPreviewRejected);

  builder
    .addCase(previewHelmValuesFile.pending, onPreviewPending)
    .addCase(previewHelmValuesFile.fulfilled, (state, action) => {
      setPreviewData(action.payload, state);
      state.previewLoader.isLoading = false;
      state.previewLoader.targetId = undefined;
      state.currentSelectionHistoryIndex = undefined;
      resetSelectionHistory(state);
      state.selectedResourceId = undefined;
      state.selectedImage = undefined;
      state.checkedResourceIds = [];
      if (action.payload.previewResourceId && state.helmValuesMap[action.payload.previewResourceId]) {
        selectFilePath({filePath: state.helmValuesMap[action.payload.previewResourceId].filePath, state});
      }
      state.selectedValuesFileId = action.payload.previewResourceId;
      state.previousSelectionHistory = [];
    })
    .addCase(previewHelmValuesFile.rejected, onPreviewRejected);

  builder
    .addCase(runPreviewConfiguration.pending, onPreviewPending)
    .addCase(runPreviewConfiguration.fulfilled, (state, action) => {
      setPreviewData(action.payload, state);
      state.previewLoader.isLoading = false;
      state.previewLoader.targetId = undefined;
      state.currentSelectionHistoryIndex = undefined;
      resetSelectionHistory(state);
      state.selectedResourceId = undefined;
      state.selectedImage = undefined;
      state.selectedPath = undefined;
      state.checkedResourceIds = [];
      state.previousSelectionHistory = [];
    })
    .addCase(runPreviewConfiguration.rejected, onPreviewRejected);

  builder
    .addCase(previewSavedCommand.pending, onPreviewPending)
    .addCase(previewSavedCommand.fulfilled, (state, action) => {
      setPreviewData(action.payload, state);
      state.previewLoader.isLoading = false;
      state.previewLoader.targetId = undefined;
      state.currentSelectionHistoryIndex = undefined;
      resetSelectionHistory(state);
      state.selectedResourceId = undefined;
      state.selectedImage = undefined;
      state.selectedPath = undefined;
      state.checkedResourceIds = [];
      state.previousSelectionHistory = [];
    })
    .addCase(previewSavedCommand.rejected, onPreviewRejected);
});
