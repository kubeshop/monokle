import {startPreviewLoader, stopPreviewLoader, clearPreview} from '@redux/reducers/main';
import {AppDispatch} from '@redux/store';
import {previewKustomization} from '@redux/thunks/previewKustomization';
import {previewCluster} from '@redux/thunks/previewCluster';
import {previewHelmValuesFile} from '@redux/thunks/previewHelmValuesFile';

export const startPreview = (
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
    dispatch(previewCluster(targetResourceId));
  }
  if (type === 'helm') {
    dispatch(previewHelmValuesFile(targetResourceId));
  }
};

export const stopPreview = (dispatch: AppDispatch) => {
  dispatch(stopPreviewLoader());
  dispatch(clearPreview());
};
