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

import {getRegisteredKindHandlers} from '@src/kindhandlers';

import {previewSavedCommand} from './previewCommand';

export const startPreview = (targetId: string, type: PreviewType, dispatch: AppDispatch) => {
  dispatch(clearPreviewAndSelectionHistory());
  dispatch(startPreviewLoader({previewType: type, targetId}));
  if (type === 'kustomization') {
    dispatch(previewKustomization(targetId));
  }
  if (type === 'cluster') {
    dispatch(previewCluster(targetId));
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
  dispatch(clearPreview({type: 'restartPreview'}));
  dispatch(startPreviewLoader({previewType: type, targetId}));
  if (type === 'kustomization') {
    dispatch(previewKustomization(targetId));
  }
  if (type === 'cluster') {
    dispatch(repreviewCluster(targetId));
  }
  if (type === 'helm') {
    dispatch(previewHelmValuesFile(targetId));
  }
  if (type === 'helm-preview-config') {
    dispatch(runPreviewConfiguration(targetId));
  }
};

export const stopPreview = (dispatch: AppDispatch) => {
  getRegisteredKindHandlers().map(kindHandler => kindHandler.disconnectFromCluster());
  dispatch(stopPreviewLoader());
  dispatch(clearPreviewAndSelectionHistory());
};
