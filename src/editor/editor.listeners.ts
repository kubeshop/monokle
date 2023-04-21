import {isAnyOf} from '@reduxjs/toolkit';

import {readFile} from 'fs/promises';
import {join} from 'path';

import {AppListenerFn} from '@redux/listeners/base';
import {processResourceRefs} from '@redux/parsing/parser.thunks';
import {selectFile, selectResource} from '@redux/reducers/main';
import {getResourceContentFromState} from '@redux/selectors/resourceGetters';
import {editorResourceIdentifierSelector} from '@redux/selectors/resourceSelectors';
import {updateResource} from '@redux/thunks/updateResource';
import {validateResources} from '@redux/validation/validation.thunks';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {isEqual} from '@shared/utils/isEqual';

import {getEditor, recreateEditorModel, resetEditor} from './editor.instance';
import {editorEnhancers} from './enhancers';
import {applyEditorRefs} from './enhancers/k8sResource/refs';
import {applyEditorValidation} from './enhancers/k8sResource/validation';

export const editorSelectionListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(selectResource, selectFile),
    async effect(_action, {getState, delay, dispatch, cancelActiveListeners}) {
      cancelActiveListeners();
      await delay(1);
      const rootFolderPath = getState().main.fileMap[ROOT_FILE_ENTRY].filePath;
      const editor = getEditor();

      if (!editor || !rootFolderPath) {
        return;
      }

      const resourceIdentifier = editorResourceIdentifierSelector(getState());
      if (resourceIdentifier) {
        const resourceContent = getResourceContentFromState(getState(), resourceIdentifier);
        if (!resourceContent) {
          return;
        }
        recreateEditorModel(editor, resourceContent.text);

        const promises = editorEnhancers.map(enhancer =>
          Promise.resolve(enhancer({state: getState(), editor, resourceIdentifier, dispatch}))
        );
        await Promise.all(promises);
      }

      if (!resourceIdentifier && isAnyOf(selectFile)(_action)) {
        const selectedFilePath = _action.payload.filePath;
        const fileText = await readFile(join(rootFolderPath, selectedFilePath), 'utf8');
        recreateEditorModel(editor, fileText);
      }
    },
  });
};

export const editorResourceUpdateListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(updateResource.fulfilled),
    async effect(_action, {getState, delay, cancelActiveListeners}) {
      cancelActiveListeners();
      await delay(1);

      // this check is used as a type guard for _action.meta.arg.resourceIdentifier
      if (!isAnyOf(updateResource.fulfilled)(_action)) {
        return;
      }

      if (_action.meta.arg.isUpdateFromEditor) {
        return;
      }

      const updatedResourceIdentifier = _action.meta.arg.resourceIdentifier;
      const editorResourceIdentifier = editorResourceIdentifierSelector(getState());

      if (!editorResourceIdentifier || !isEqual(editorResourceIdentifier, updatedResourceIdentifier)) {
        return;
      }

      const resourceContent = getResourceContentFromState(getState(), editorResourceIdentifier);

      const editor = getEditor();
      const editorModel = editor?.getModel();
      if (!editor || !editorModel || !resourceContent) {
        return;
      }

      const editorText = editorModel.getValue();
      if (editorText === resourceContent?.text) {
        return;
      }

      editorModel.setValue(resourceContent.text);
    },
  });
};

export const editorResourceRefsListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(processResourceRefs.fulfilled),
    async effect(_action, {getState, delay, cancelActiveListeners, dispatch}) {
      cancelActiveListeners();
      await delay(1);

      const editorResourceIdentifier = editorResourceIdentifierSelector(getState());
      resetEditor();

      const editor = getEditor();
      if (!editor) {
        return;
      }
      applyEditorRefs({state: getState(), resourceIdentifier: editorResourceIdentifier, editor, dispatch});
    },
  });
};

export const editorValidationListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(validateResources.fulfilled),
    async effect(_action, {getState, delay, cancelActiveListeners, dispatch}) {
      cancelActiveListeners();
      await delay(1);

      const editorResourceIdentifier = editorResourceIdentifierSelector(getState());
      const editor = getEditor();
      if (!editor) {
        return;
      }
      applyEditorValidation({state: getState(), resourceIdentifier: editorResourceIdentifier, editor, dispatch});
    },
  });
};

export const editorListeners: AppListenerFn[] = [
  editorSelectionListener,
  editorResourceUpdateListener,
  editorResourceRefsListener,
  editorValidationListener,
];
