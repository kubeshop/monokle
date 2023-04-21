import {isAnyOf} from '@reduxjs/toolkit';

import {readFile} from 'fs/promises';
import {join} from 'path';

import {AppListenerFn} from '@redux/listeners/base';
import {selectFile, selectResource} from '@redux/reducers/main';
import {getResourceContentFromState} from '@redux/selectors/resourceGetters';
import {editorResourceIdentifierSelector} from '@redux/selectors/resourceSelectors';
import {updateFileEntry} from '@redux/thunks/updateFileEntry';
import {updateResource} from '@redux/thunks/updateResource';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';

import {getEditor, recreateEditorModel, resetEditor} from './editor.instance';
import {editorEnhancers} from './enhancers';

export const editorSelectionListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(selectResource, selectFile, updateResource.fulfilled, updateFileEntry.fulfilled),
    async effect(_action, {getState, delay, dispatch, cancelActiveListeners}) {
      cancelActiveListeners();
      await delay(1);
      const rootFolderPath = getState().main.fileMap[ROOT_FILE_ENTRY].filePath;
      const editor = getEditor();

      const shouldRecreateEditor = isAnyOf(selectResource, selectFile)(_action);

      if (!editor || !rootFolderPath) {
        return;
      }

      const resourceIdentifier = editorResourceIdentifierSelector(getState());
      if (resourceIdentifier) {
        const resourceContent = getResourceContentFromState(getState(), resourceIdentifier);
        if (!resourceContent) {
          return;
        }
        shouldRecreateEditor ? recreateEditorModel(editor, resourceContent.text) : resetEditor();

        const promises = editorEnhancers.map(enhancer =>
          Promise.resolve(enhancer({state: getState(), editor, resourceIdentifier, dispatch}))
        );
        await Promise.all(promises);
      }

      if (!resourceIdentifier && isAnyOf(selectFile)(_action)) {
        const selectedFilePath = _action.payload.filePath;
        const fileText = await readFile(join(rootFolderPath, selectedFilePath), 'utf8');
        shouldRecreateEditor ? recreateEditorModel(editor, fileText) : resetEditor();
      }
    },
  });
};

export const editorListeners = [editorSelectionListener];
