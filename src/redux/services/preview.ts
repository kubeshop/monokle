import {setClusterProxyPort} from '@redux/reducers/appConfig';
import {clearPreview, clearPreviewAndSelectionHistory} from '@redux/reducers/main';
import {previewHelmValuesFile} from '@redux/thunks/previewHelmValuesFile';
import {previewKustomization} from '@redux/thunks/previewKustomization';
import {runPreviewConfiguration} from '@redux/thunks/runPreviewConfiguration';
import {startClusterPreview} from '@redux/thunks/startClusterPreview';

import {AppDispatch} from '@shared/models/appDispatch';
import {PreviewType} from '@shared/models/appState';
import {closeKubectlProxy} from '@shared/utils/commands/kubectl';
import {trackEvent} from '@shared/utils/telemetry';

import {disconnectFromCluster} from './clusterResourceWatcher';
import {previewSavedCommand} from './previewCommand';

export const startPreview = (targetId: string, type: PreviewType, dispatch: AppDispatch) => {
  dispatch(clearPreviewAndSelectionHistory());

  if (type === 'kustomization') {
    dispatch(previewKustomization(targetId));
  }
  if (type === 'cluster') {
    dispatch(startClusterPreview({clusterContext: targetId}));
  }
  if (type === 'helm') {
    dispatch(previewHelmValuesFile(targetId));
  }
  if (type === 'helm-preview-config') {
    dispatch(runPreviewConfiguration(targetId));
  }
  if (type === 'command') {
    dispatch(previewSavedCommand(targetId));
  }
};

export const restartPreview = (targetId: string, type: PreviewType, dispatch: AppDispatch) => {
  trackEvent('preview/restart', {type});
  disconnectFromCluster();
  dispatch(clearPreview({type: 'restartPreview'}));
  if (type === 'kustomization') {
    dispatch(previewKustomization(targetId));
  }
  if (type === 'cluster') {
    dispatch(startClusterPreview({clusterContext: targetId, isRestart: true}));
  }
  if (type === 'helm') {
    dispatch(previewHelmValuesFile(targetId));
  }
  if (type === 'helm-preview-config') {
    dispatch(runPreviewConfiguration(targetId));
  }
};

export const stopPreview = (dispatch: AppDispatch) => {
  dispatch(setClusterProxyPort(undefined));
  disconnectFromCluster();
  dispatch(clearPreviewAndSelectionHistory());
  closeKubectlProxy();
};
