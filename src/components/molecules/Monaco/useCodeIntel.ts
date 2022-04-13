import {useEffect, useRef} from 'react';
import {monaco} from 'react-monaco-editor';

import fs from 'fs';
import {debounce} from 'lodash';
import path from 'path';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {FileMapType, HelmChartMapType, HelmValuesMapType, ResourceFilterType, ResourceMapType} from '@models/appstate';
import {K8sResource, ResourceRef} from '@models/k8sresource';

import {InlineDecorationTypes} from '@molecules/Monaco/editorConstants';
import {getHelmValueRanges, getObjectKeys} from '@molecules/Monaco/helmCodeIntel';

import {parseAllYamlDocuments} from '@utils/yaml';

import codeIntel from './codeIntel';
import {clearDecorations, createInlineDecoration, createLinkProvider, setDecorations, setMarkers} from './editorHelpers';

interface CodeIntelProps {
  editor: monaco.editor.IStandaloneCodeEditor | null;
  selectedResource: K8sResource | undefined;
  code: string | undefined;
  resourceMap: ResourceMapType;
  fileMap: FileMapType;
  isEditorMounted: boolean;
  selectResource: (resourceId: string) => void;
  selectFilePath: (filePath: string) => void;
  createResource: ((outgoingRef: ResourceRef, namespace?: string, targetFolder?: string) => void) | undefined;
  filterResources: (filter: ResourceFilterType) => void;
  selectedPath?: string;
  helmChartMap?: HelmChartMapType;
  helmValuesMap?: HelmValuesMapType;
}

function useCodeIntel(props: CodeIntelProps) {
  const {
    editor,
    selectedResource,
    code,
    resourceMap,
    fileMap,
    isEditorMounted,
    selectResource,
    selectFilePath,
    createResource,
    filterResources,
    selectedPath,
    helmChartMap,
    helmValuesMap,
  } = props;

  const idsOfDecorationsRef = useRef<string[]>([]);
  const disposablesRef = useRef<monaco.IDisposable[]>([]);
  const completionDisposableRef = useRef<monaco.IDisposable | null>(null);
  const currentFile = Object.values(fileMap).find(file => selectedPath === file.filePath);

  const clearCodeIntel = () => {
    if (editor) {
      clearDecorations(editor, idsOfDecorationsRef.current);
      idsOfDecorationsRef.current = [];
    }
    disposablesRef.current.forEach(disposable => disposable.dispose());
    disposablesRef.current = [];
  };

  const applyCodeIntel = () => {
    if (!editor) {
      return;
    }
    const {helmNewDisposables, helmNewDecorations} = helmCodeIntel();
    if (selectedResource) {
      codeIntel
        .applyForResource(
          selectedResource,
          selectResource,
          selectFilePath,
          createResource,
          filterResources,
          resourceMap,
          fileMap,
          editor.getModel()
        )
        .then(({newDecorations, newDisposables, newMarkers}) => {
          idsOfDecorationsRef.current = setDecorations(editor, [...newDecorations, ...helmNewDecorations]);
          disposablesRef.current = [...newDisposables, ...helmNewDisposables];

          const model = editor.getModel();
          if (model) setMarkers(model, newMarkers);
        });
    } else if (currentFile?.helmChartId) {
      idsOfDecorationsRef.current = setDecorations(editor, helmNewDecorations);
      disposablesRef.current = helmNewDisposables;
    }
  };

  const helmCodeIntel = () => {
    const helmNewDecorations: monaco.editor.IModelDeltaDecoration[] = [];
    const helmNewDisposables: monaco.IDisposable[] = [];
    const helmValueRanges = getHelmValueRanges(code);

    if (!helmValueRanges.length || !helmValuesMap || !helmChartMap || !currentFile) {
      return {helmNewDisposables, helmNewDecorations};
    }

    const validKeyPaths: string[] = [];
    const fileHelmChart = helmChartMap[currentFile.helmChartId as string];
    const valueFilePaths = fileHelmChart.valueFileIds.map(valueFileId => helmValuesMap[valueFileId].filePath);

    valueFilePaths.forEach(valueFilePath => {
      const valueFileContent = fs.readFileSync(path.join(fileMap[ROOT_FILE_ENTRY].filePath, valueFilePath), 'utf8');
      const documents = parseAllYamlDocuments(valueFileContent);
      documents.forEach(doc => {
        validKeyPaths.push(...getObjectKeys(doc.toJS(), '.Values.'));
      });
    });

    // log.info('helmValueRanges', helmValueRanges);
    helmValueRanges.forEach(helmValueRange => {
      const canFindKeyInValuesFile = validKeyPaths.includes(helmValueRange.value);
      helmNewDecorations.push(
        createInlineDecoration(
          helmValueRange.range,
          canFindKeyInValuesFile ? InlineDecorationTypes.SatisfiedRef : InlineDecorationTypes.UnsatisfiedRef
        )
      );

      const linkDisposable = createLinkProvider(helmValueRange.range, 'aaa', () => {
        selectFilePath(valueFilePaths[0]);
      });
      helmNewDisposables.push(linkDisposable);
    });

    return {helmNewDisposables, helmNewDecorations};
  };

  const debouncedUpdate = debounce(() => {
    clearCodeIntel();
    applyCodeIntel();
  }, 100);

  useEffect(() => {
    debouncedUpdate();

    return () => {
      debouncedUpdate.cancel();
      clearCodeIntel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, isEditorMounted, selectedResource, resourceMap, editor]);

  useEffect(() => {
    if (completionDisposableRef.current && completionDisposableRef.current.dispose) {
      completionDisposableRef.current.dispose();
    }
    if (editor) {
      completionDisposableRef.current = codeIntel.applyAutocomplete(resourceMap);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResource, resourceMap, editor]);
}

export default useCodeIntel;
