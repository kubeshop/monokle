import {isAnyOf} from '@reduxjs/toolkit';

import {readFile} from 'fs/promises';
import * as monaco from 'monaco-editor';
import {join} from 'path';

import {AppListenerFn} from '@redux/listeners/base';
import {selectFile, selectResource} from '@redux/reducers/main';
import {getResourceContentFromState} from '@redux/selectors/resourceGetters';
import {updateFileEntry} from '@redux/thunks/updateFileEntry';
import {updateResource} from '@redux/thunks/updateResource';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {ResourceIdentifier} from '@shared/models/k8sResource';

import {getEditor, resetEditor} from './editor.instance';
import {editorEnhancers} from './enhancers';

export function recreateEditorModel(editor: monaco.editor.ICodeEditor, text: string, language: string = 'yaml') {
  resetEditor();
  editor.getModel()?.dispose();
  editor.setModel(monaco.editor.createModel(text, language));
}

export const editorListener: AppListenerFn = listen => {
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

      let selectedResourceIdentifier: ResourceIdentifier | undefined;

      if (isAnyOf(selectFile)(_action)) {
        const selectedFilePath = _action.payload.filePath;
        const resourceIdentifiersFromFile = Object.values(getState().main.resourceMetaMapByStorage.local)
          .filter(r => r.origin.filePath === selectedFilePath)
          .map(r => ({id: r.id, storage: r.storage}));

        if (resourceIdentifiersFromFile.length === 1) {
          selectedResourceIdentifier = resourceIdentifiersFromFile[0];
        } else {
          const fileText = await readFile(join(rootFolderPath, selectedFilePath), 'utf8');
          shouldRecreateEditor ? recreateEditorModel(editor, fileText) : resetEditor();
        }
      }

      if (isAnyOf(selectResource)(_action)) {
        selectedResourceIdentifier = _action.payload.resourceIdentifier;
      }

      if (selectedResourceIdentifier) {
        const resourceContent = getResourceContentFromState(getState(), selectedResourceIdentifier);
        if (!resourceContent) {
          return;
        }
        shouldRecreateEditor ? recreateEditorModel(editor, resourceContent.text) : resetEditor();

        const promises = editorEnhancers.map(enhancer =>
          Promise.resolve(
            enhancer({state: getState(), editor, resourceIdentifier: selectedResourceIdentifier, dispatch})
          )
        );
        await Promise.all(promises);
      }
    },
  });
};
