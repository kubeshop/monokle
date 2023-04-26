import {isAnyOf} from '@reduxjs/toolkit';

import {readFile} from 'fs/promises';
import {join} from 'path';

import {AppListenerFn} from '@redux/listeners/base';
import {selectFile, selectResource} from '@redux/reducers/main';
import {selectedFilePathSelector} from '@redux/selectors';
import {getResourceContentFromState} from '@redux/selectors/resourceGetters';
import {editorResourceIdentifierSelector} from '@redux/selectors/resourceSelectors';

import {getEditor, recreateEditorModel} from '@editor/editor.instance';
import {editorMounted} from '@editor/editor.slice';
import {editorEnhancers} from '@editor/enhancers';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';

export const editorSelectionListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(editorMounted, selectResource, selectFile),
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

      const selectedFilePath = selectedFilePathSelector(getState());
      if (!resourceIdentifier && selectedFilePath) {
        const fileText = await readFile(join(rootFolderPath, selectedFilePath), 'utf8');
        recreateEditorModel(editor, fileText);
      }
    },
  });
};
