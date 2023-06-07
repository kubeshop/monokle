import {isAnyOf} from '@reduxjs/toolkit';

import {readFile} from 'fs/promises';
import {isArray} from 'lodash';
import {join} from 'path';

import {AppListenerFn} from '@redux/listeners/base';
import {updateMultipleClusterResources} from '@redux/reducers/main';
import {selectedFilePathSelector} from '@redux/selectors';
import {getResourceContentFromState, getResourceMetaFromState} from '@redux/selectors/resourceGetters';
import {editorResourceIdentifierSelector} from '@redux/selectors/resourceSelectors';
import {applyResourceToCluster} from '@redux/thunks/applyResource';
import {multiplePathsChanged} from '@redux/thunks/multiplePathsChanged';
import {updateFileEntry} from '@redux/thunks/updateFileEntry';
import {updateResource} from '@redux/thunks/updateResource';

import {getEditor} from '@editor/editor.instance';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {isLocalResourceMeta} from '@shared/models/k8sResource';
import {isEqual} from '@shared/utils/isEqual';

export const editorTextUpdateListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(
      updateResource.fulfilled,
      updateMultipleClusterResources,
      updateFileEntry.fulfilled,
      multiplePathsChanged.fulfilled,
      applyResourceToCluster.fulfilled
    ),
    async effect(_action, {getState, delay, cancelActiveListeners}) {
      cancelActiveListeners();
      await delay(1);
      const rootFolderPath = getState().main.fileMap[ROOT_FILE_ENTRY]?.filePath;
      const selectedFilePath = selectedFilePathSelector(getState());

      if (!_action.meta || _action.meta.arg.isUpdateFromEditor || !rootFolderPath) {
        return;
      }

      let updatedText: string | undefined;

      const editorResourceIdentifier = editorResourceIdentifierSelector(getState());

      if (
        isAnyOf(updateResource.fulfilled, updateMultipleClusterResources, applyResourceToCluster.fulfilled)(_action)
      ) {
        if (!editorResourceIdentifier) {
          return;
        }

        // return early if the resource affected by the updateResource action is not the one currently opened in the editor
        if (
          'meta' in _action &&
          _action.meta.arg.resourceIdentifier &&
          !isEqual(_action.meta.arg.resourceIdentifier, editorResourceIdentifier)
        ) {
          return;
        }

        // return early if the updateMultipleClusterResources action has not affected the resource currently opened in the editor
        if (
          isArray(_action.payload) &&
          !_action.payload.some(
            r => r.id === editorResourceIdentifier.id && r.storage === editorResourceIdentifier.storage
          )
        ) {
          return;
        }

        const resourceContent = getResourceContentFromState(getState(), editorResourceIdentifier);
        updatedText = resourceContent?.text;
      }

      if (isAnyOf(updateFileEntry.fulfilled, multiplePathsChanged.fulfilled)(_action)) {
        const editorResourceMeta = editorResourceIdentifier
          ? getResourceMetaFromState(getState(), editorResourceIdentifier)
          : undefined;

        if (!editorResourceMeta || !isLocalResourceMeta(editorResourceMeta)) {
          if (!selectedFilePath) {
            return;
          }

          const wasSelectedFileUpdated = 'path' in _action.meta.arg && _action.meta.arg.path === selectedFilePath;
          const wasSelectedFileReloaded =
            'reloadedFilePaths' in _action.payload && _action.payload.reloadedFilePaths.includes(selectedFilePath);

          if (wasSelectedFileUpdated || wasSelectedFileReloaded) {
            const fileText = await readFile(join(rootFolderPath, selectedFilePath), 'utf8');
            updatedText = fileText;
          }
        } else {
          const wasFileContainingEditorResourceUpdated =
            'path' in _action.meta.arg && editorResourceMeta.origin.filePath === _action.meta.arg.path;

          const wasFileContainingEditorResourceReloaded =
            'reloadedFilePaths' in _action.payload &&
            _action.payload.reloadedFilePaths
              .map(absolutePath => {
                const relativePath = absolutePath.slice(rootFolderPath.length);
                return relativePath;
              })
              .includes(editorResourceMeta.origin.filePath);

          if (wasFileContainingEditorResourceUpdated || wasFileContainingEditorResourceReloaded) {
            const resourceContent = getResourceContentFromState(getState(), editorResourceMeta);
            updatedText = resourceContent?.text;
          }
        }
      }

      const editor = getEditor();
      const editorModel = editor?.getModel();
      if (!editor || !editorModel || !updatedText) {
        return;
      }

      const editorText = editorModel.getValue();
      if (editorText === updatedText) {
        return;
      }

      editorModel.setValue(updatedText);
    },
  });
};
