import {restartPreview} from '@redux/services/preview';
import store from '@redux/store';

export const restartEditorPreview = () => {
  const {previewType, selectedValuesFileId, selectedResourceId} = store.getState().main;
  const resourceId = selectedResourceId || selectedValuesFileId;

  if (resourceId && previewType) {
    restartPreview(resourceId, previewType, store.dispatch);
  }
};
