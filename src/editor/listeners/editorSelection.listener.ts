import {isAnyOf} from '@reduxjs/toolkit';

import {readFile} from 'fs/promises';
import {setDiagnosticsOptions} from 'monaco-yaml';
import {join} from 'path';

import {AppListenerFn} from '@redux/listeners/base';
import {selectFile, selectHelmValuesFile, selectResource} from '@redux/reducers/main';
import {selectedFilePathSelector} from '@redux/selectors';
import {getResourceContentFromState, getResourceMetaFromState} from '@redux/selectors/resourceGetters';
import {editorResourceIdentifierSelector} from '@redux/selectors/resourceSelectors';
import {isKustomizationPatch} from '@redux/services/kustomize';
import {isSupportedResource} from '@redux/services/resource';
import {getResourceSchema, getSchemaForPath} from '@redux/services/schema';

import {MONACO_YAML_BASE_DIAGNOSTICS_OPTIONS} from '@editor/editor.constants';
import {getEditor, recreateEditorModel} from '@editor/editor.instance';
import {editorMounted} from '@editor/editor.slice';
import {editorEnhancers} from '@editor/enhancers';
import {helmValuesFileEnhancer} from '@editor/enhancers/helm/valuesFile';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {ResourceMeta} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';
import {isHelmValuesFileSelection} from '@shared/models/selection';

export const editorSelectionListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(editorMounted, selectResource, selectFile, selectHelmValuesFile),
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
        const resourceMeta = getResourceMetaFromState(getState(), resourceIdentifier);
        const resourceContent = getResourceContentFromState(getState(), resourceIdentifier);
        if (!resourceMeta || !resourceContent) {
          return;
        }
        recreateEditorModel(editor, resourceContent.text);
        enableResourceSchemaValidation(resourceMeta, getState());

        if (resourceMeta.storage === 'preview') {
          editor.updateOptions({
            readOnly: true,
          });
        } else {
          editor.updateOptions({
            readOnly: false,
          });
        }

        const promises = editorEnhancers.map(enhancer =>
          Promise.resolve(enhancer({state: getState(), editor, resourceIdentifier, dispatch}))
        );
        await Promise.all(promises);
      }

      const selectedHelmValuesFilePath = getSelectedHelmValuesFilePath(getState());
      const selectedFilePath = selectedFilePathSelector(getState()) ?? selectedHelmValuesFilePath;
      if (!resourceIdentifier && selectedFilePath) {
        const fileText = await readFile(join(rootFolderPath, selectedFilePath), 'utf8');
        recreateEditorModel(editor, fileText);
        enableFileSchemaValidation(selectedFilePath, getState());
      }

      if (selectedHelmValuesFilePath) {
        helmValuesFileEnhancer({state: getState(), editor, resourceIdentifier, dispatch});
      }
    },
  });
};

const getSelectedHelmValuesFilePath = (state: RootState) => {
  const selection = state.main.selection;
  if (!isHelmValuesFileSelection(selection)) {
    return undefined;
  }
  const helmValuesFile = state.main.helmValuesMap[selection.valuesFileId];
  if (!helmValuesFile) {
    return undefined;
  }
  return helmValuesFile.filePath;
};

const enableResourceSchemaValidation = (resourceMeta: ResourceMeta, state: RootState) => {
  const k8sVersion = state.config.k8sVersion;
  const userDataDir = state.config.userDataDir;

  if (!userDataDir) {
    return;
  }

  const resourceSchema = getResourceSchema(resourceMeta, k8sVersion, userDataDir);
  const validate = resourceSchema && !isKustomizationPatch(resourceMeta) && isSupportedResource(resourceMeta);

  setDiagnosticsOptions({
    ...MONACO_YAML_BASE_DIAGNOSTICS_OPTIONS,
    validate,
    isKubernetes: true,
    schemas: [
      {
        uri: 'http://monokle/k8s.json',
        fileMatch: ['*'],
        schema: resourceSchema || {},
      },
    ],
  });
};

const enableFileSchemaValidation = (filePath: string, state: RootState) => {
  const fileSchema = getSchemaForPath(filePath, state.main.fileMap);
  const validate = fileSchema !== undefined;

  setDiagnosticsOptions({
    ...MONACO_YAML_BASE_DIAGNOSTICS_OPTIONS,
    validate,
    isKubernetes: true,
    schemas: [
      {
        uri: 'http://monokle/k8s.json',
        fileMatch: ['*'],
        schema: fileSchema || {},
      },
    ],
  });
};
