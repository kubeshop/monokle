import {AppDispatch} from '@models/appdispatch';
import {PreviewType} from '@models/appstate';

import {
  clearPreview,
  clearPreviewAndSelectionHistory,
  startPreviewLoader,
  stopPreviewLoader,
} from '@redux/reducers/main';
import {previewCluster, repreviewCluster} from '@redux/thunks/previewCluster';
import {previewHelmValuesFile} from '@redux/thunks/previewHelmValuesFile';
import {previewKustomization} from '@redux/thunks/previewKustomization';
import {runPreviewConfiguration} from '@redux/thunks/runPreviewConfiguration';

import {closeKubectlProxy, openKubectlProxy} from '@utils/commands/kubectl';
import electronStore from '@utils/electronStore';
import {trackEvent} from '@utils/telemetry';

import {disconnectFromCluster} from './clusterResourceWatcher';
import {previewSavedCommand} from './previewCommand';

const PROXY_PORT_REGEX = /127.0.0.1:[0-9]+/;

const startClusterPreview = async (clusterContext: string, dispatch: AppDispatch, isRestart?: boolean) => {
  // TODO: if we convert the *startPreview* function to a thunk, then we could get this from the state instead
  const shouldUseKubectlProxy = electronStore.get('appConfig.useKubectlProxy');

  if (!shouldUseKubectlProxy) {
    if (isRestart) {
      dispatch(repreviewCluster({context: clusterContext}));
    } else {
      dispatch(previewCluster({context: clusterContext}));
    }
    return;
  }

  // TODO: if the listener has not been called in 10 seconds, then stop the preview and send an error notification
  const kubectlProxyListener = (event: any) => {
    if (event.type === 'error' || event.type === 'exit') {
      stopPreview(dispatch);
      return;
    }

    if (event.type === 'stdout' && event.result && event.result.data) {
      const proxyPortMatches = PROXY_PORT_REGEX.exec(event.result.data);
      const proxyPortString = proxyPortMatches?.[0]?.split(':')[1];
      const proxyPort = proxyPortString ? parseInt(proxyPortString, 10) : undefined;

      if (!proxyPort) {
        return;
      }

      if (isRestart) {
        dispatch(repreviewCluster({context: clusterContext, port: proxyPort}));
      } else {
        dispatch(previewCluster({context: clusterContext, port: proxyPort}));
      }
    }
  };

  openKubectlProxy(kubectlProxyListener);
};

export const startPreview = (targetId: string, type: PreviewType, dispatch: AppDispatch) => {
  dispatch(clearPreviewAndSelectionHistory());
  dispatch(startPreviewLoader({previewType: type, targetId}));
  if (type === 'kustomization') {
    dispatch(previewKustomization(targetId));
  }
  if (type === 'cluster') {
    startClusterPreview(targetId, dispatch);
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
  dispatch(clearPreview({type: 'restartPreview'}));
  dispatch(startPreviewLoader({previewType: type, targetId}));
  if (type === 'kustomization') {
    dispatch(previewKustomization(targetId));
  }
  if (type === 'cluster') {
    startClusterPreview(targetId, dispatch, true);
  }
  if (type === 'helm') {
    dispatch(previewHelmValuesFile(targetId));
  }
  if (type === 'helm-preview-config') {
    dispatch(runPreviewConfiguration(targetId));
  }
};

export const stopPreview = (dispatch: AppDispatch) => {
  disconnectFromCluster();
  dispatch(stopPreviewLoader());
  dispatch(clearPreviewAndSelectionHistory());
  closeKubectlProxy();
};
