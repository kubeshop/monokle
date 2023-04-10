import {clearPreviewAndSelectionHistory} from '@redux/reducers/main';
import {previewHelmValuesFile} from '@redux/thunks/previewHelmValuesFile';
import {previewKustomization} from '@redux/thunks/previewKustomization';
import {runPreviewConfiguration} from '@redux/thunks/runPreviewConfiguration';

import {AppDispatch} from '@shared/models/appDispatch';
import {AnyPreview} from '@shared/models/preview';
import {trackEvent} from '@shared/utils/telemetry';

import {previewSavedCommand} from './previewCommand';

export const startPreview = (preview: AnyPreview, dispatch: AppDispatch) => {
  dispatch(clearPreviewAndSelectionHistory({revalidate: false}));

  if (preview.type === 'kustomize') {
    dispatch(previewKustomization(preview.kustomizationId));
  }
  if (preview.type === 'helm') {
    dispatch(previewHelmValuesFile(preview.valuesFileId));
  }
  if (preview.type === 'helm-config') {
    dispatch(runPreviewConfiguration(preview.configId));
  }
  if (preview.type === 'command') {
    dispatch(previewSavedCommand(preview.commandId));
  }
};

export const restartPreview = (preview: AnyPreview, dispatch: AppDispatch) => {
  trackEvent('preview/restart', {type: preview.type});

  // delegate to the startPreview method - which does all the same stuff
  startPreview(preview, dispatch);
};

export const stopPreview = (dispatch: AppDispatch) => {
  dispatch(clearPreviewAndSelectionHistory({revalidate: true}));
};
