import {
  clearPreview,
  clearPreviewAndSelectionHistory,
  startPreviewLoader,
  stopPreviewLoader,
} from '@redux/reducers/main';
import {AppDispatch} from '@redux/store';
import {previewCluster, repreviewCluster} from '@redux/thunks/previewCluster';
import {previewHelmValuesFile} from '@redux/thunks/previewHelmValuesFile';
import {previewKustomization} from '@redux/thunks/previewKustomization';

export const startPreview = (
  targetResourceId: string,
  type: 'kustomization' | 'cluster' | 'helm',
  dispatch: AppDispatch
) => {
  dispatch(clearPreviewAndSelectionHistory());
  dispatch(startPreviewLoader({previewType: type, targetResourceId}));
  if (type === 'kustomization') {
    dispatch(previewKustomization(targetResourceId));
  }
  if (type === 'cluster') {
    dispatch(previewCluster(targetResourceId));
  }
  if (type === 'helm') {
    dispatch(previewHelmValuesFile(targetResourceId));
  }
};

export const restartPreview = (
  targetResourceId: string,
  type: 'kustomization' | 'cluster' | 'helm',
  dispatch: AppDispatch
) => {
  dispatch(clearPreview());
  dispatch(startPreviewLoader({previewType: type, targetResourceId}));
  if (type === 'kustomization') {
    dispatch(previewKustomization(targetResourceId));
  }
  if (type === 'cluster') {
    dispatch(repreviewCluster(targetResourceId));
  }
  if (type === 'helm') {
    dispatch(previewHelmValuesFile(targetResourceId));
  }
};

export const stopPreview = (dispatch: AppDispatch) => {
  dispatch(stopPreviewLoader());
  dispatch(clearPreviewAndSelectionHistory());
};
