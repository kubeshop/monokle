import {setClusterProxyPort} from '@redux/reducers/appConfig';
import {clearPreview, clearPreviewAndSelectionHistory} from '@redux/reducers/main';
import {previewHelmValuesFile} from '@redux/thunks/previewHelmValuesFile';
import {previewKustomization} from '@redux/thunks/previewKustomization';
import {runPreviewConfiguration} from '@redux/thunks/runPreviewConfiguration';

import {AppDispatch} from '@shared/models/appDispatch';
import {AnyPreview} from '@shared/models/preview';
import {closeKubectlProxy} from '@shared/utils/commands/kubectl';
import {trackEvent} from '@shared/utils/telemetry';

import {disconnectFromCluster} from './clusterResourceWatcher';
import {previewSavedCommand} from './previewCommand';

export const startPreview = (preview: AnyPreview, dispatch: AppDispatch) => {
  dispatch(clearPreviewAndSelectionHistory());

  if (preview.type === 'kustomize') {
    dispatch(previewKustomization(preview.kustomizationId));
  }
  // TODO: remove cluster preview from here
  // if (preview.type === 'cluster') {
  //   dispatch(startClusterPreview({clusterContext: targetId}));
  // }
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

// TODO: do we really need a separate function for this?
export const restartPreview = (preview: AnyPreview, dispatch: AppDispatch) => {
  trackEvent('preview/restart', {type: preview.type});
  disconnectFromCluster();
  dispatch(clearPreview({type: 'restartPreview'}));
  if (preview.type === 'kustomize') {
    dispatch(previewKustomization(preview.kustomizationId));
  }
  // if (preview.type === 'cluster') {
  //   dispatch(startClusterPreview({clusterContext: targetId, isRestart: true}));
  // }
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

export const stopPreview = (dispatch: AppDispatch) => {
  dispatch(setClusterProxyPort(undefined));
  disconnectFromCluster();
  dispatch(clearPreviewAndSelectionHistory());
  closeKubectlProxy();
};
