import {previewSavedCommand} from '@redux/services/previewCommand';
import {splitK8sResourceMap} from '@redux/services/resource';
import {resetSelectionHistory} from '@redux/services/selectionHistory';
import {previewHelmValuesFile} from '@redux/thunks/previewHelmValuesFile';
import {previewKustomization} from '@redux/thunks/previewKustomization';
import {runPreviewConfiguration} from '@redux/thunks/runPreviewConfiguration';

import {AppState} from '@shared/models/appState';
import {K8sResource} from '@shared/models/k8sResource';
import {PreviewOrigin} from '@shared/models/origin';
import {AnyPreview} from '@shared/models/preview';
import {
  AppSelection,
  CommandSelection,
  HelmValuesFileSelection,
  PreviewConfigurationSelection,
  ResourceSelection,
} from '@shared/models/selection';
import {createSliceExtraReducers} from '@shared/utils/redux';

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
  payload: {resources: K8sResource<PreviewOrigin<Preview>>[]; preview: Preview},
  initialSelection?: AppSelection
) => {
  state.previewOptions.isLoading = false;
  state.checkedResourceIds = [];

  const {metaMap, contentMap} = splitK8sResourceMap(payload.resources);

  state.resourceMetaStorage.preview = metaMap;
  state.resourceContentStorage.preview = contentMap;

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
        resourceId: action.payload.preview.kustomizationId,
        resourceStorage: 'local',
      } as const;

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
