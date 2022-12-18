import getPort from 'get-port';

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

import {killKubeProxy, startKubeProxy} from '@utils/kubeclient';
import {trackEvent} from '@utils/telemetry';

import {disconnectFromCluster} from './clusterResourceWatcher';
import {previewSavedCommand} from './previewCommand';

export const startPreview = (targetId: string, type: PreviewType, dispatch: AppDispatch) => {
  dispatch(clearPreviewAndSelectionHistory());
  dispatch(startPreviewLoader({previewType: type, targetId}));
  if (type === 'kustomization') {
    dispatch(previewKustomization(targetId));
  }
  if (type === 'cluster') {
    getPort().then(port => {
      startKubeProxy(port, (event: any) => {
        if (event.result && event.result.data && event.result.data.includes(`Starting to serve on 127.0.0.1:${port}`)) {
          dispatch(previewCluster({context: targetId, port}));
        }
        if (event.type === 'error' || event.type === 'exit') {
          stopPreview(dispatch);
        }
      });
    });
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
    getPort().then(port => {
      startKubeProxy(port, (event: any) => {
        if (event.result && event.result.data && event.result.data.includes(`Starting to serve on 127.0.0.1:${port}`)) {
          dispatch(repreviewCluster({context: targetId, port}));
        }
        if (event.type === 'error' || event.type === 'exit') {
          stopPreview(dispatch);
        }
      });
    });
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
  killKubeProxy(() => {});
  dispatch(stopPreviewLoader());
  dispatch(clearPreviewAndSelectionHistory());
};
