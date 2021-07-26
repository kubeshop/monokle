import {startPreviewLoader, stopPreviewLoader, clearPreview} from '@redux/reducers/main';
import {previewKustomization, previewCluster, previewHelmValuesFile} from '@redux/reducers/thunks';
import {AppDispatch} from '@redux/store';

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
