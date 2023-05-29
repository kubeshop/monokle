import store from '@redux/store';
import {restartPreview} from '@redux/thunks/preview';

// TODO: maybe we should refactor how we restart the preview
// importing the store in this file and then using the following method anywhere in the code is not ideal
// I could see this leading to circular dependencies
export const restartEditorPreview = () => {
  const {preview} = store.getState().main;

  if (!preview) {
    return;
  }

  store.dispatch(restartPreview(preview));
};
