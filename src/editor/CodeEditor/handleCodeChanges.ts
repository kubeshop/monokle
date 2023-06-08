import {debounce} from 'lodash';
import log from 'loglevel';

import {selectedFilePathSelector, selectedHelmValuesSelector} from '@redux/selectors';
import {selectedResourceIdentifierSelector} from '@redux/selectors/resourceSelectors';
import store from '@redux/store';
import {updateFileEntry} from '@redux/thunks/updateFileEntry';
import {updateResource} from '@redux/thunks/updateResource';

import {getEditor, getEditorType, resetEditor, subscribeToEditorModelContentChanges} from '@editor/editor.instance';
import {AppDispatch} from '@shared/models/appDispatch';
import {ResourceIdentifier} from '@shared/models/k8sResource';

// this is needed to get the correct type for dispatch
const dispatch: AppDispatch = store.dispatch;

const debouncedCodeSave = debounce(
  (payload: {
    code: string;
    selectedPath: string | undefined;
    selectedResourceIdentifier: ResourceIdentifier | undefined;
  }) => {
    const {code, selectedPath, selectedResourceIdentifier} = payload;
    // is a file and no resource selected?
    if (selectedPath && !selectedResourceIdentifier) {
      try {
        dispatch(updateFileEntry({path: selectedPath, text: code, isUpdateFromEditor: true}));
        return true;
      } catch (e) {
        log.warn(`Failed to update file ${e}`);
        return false;
      }
    } else if (selectedResourceIdentifier) {
      try {
        dispatch(
          updateResource({resourceIdentifier: selectedResourceIdentifier, text: code, isUpdateFromEditor: true})
        );
        resetEditor();
        return true;
      } catch (e) {
        log.warn(`Failed to update resource ${e}`);
        return false;
      }
    }
  },
  250
);

const onCodeChange = () => {
  const editor = getEditor();
  const editorType = getEditorType();
  if (!editor || editorType === 'cluster') {
    return;
  }

  const state = store.getState();
  const selectedPath = selectedFilePathSelector(state);
  const selectedHelmValuesFile = selectedHelmValuesSelector(state);
  const selectedResourceIdentifier = selectedResourceIdentifierSelector(state);
  const code = editor.getModel()?.getValue();
  if (code) {
    debouncedCodeSave({
      code,
      selectedPath: selectedPath ?? selectedHelmValuesFile?.filePath,
      selectedResourceIdentifier,
    });
  }
};

subscribeToEditorModelContentChanges(onCodeChange);
