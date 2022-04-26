import {useEffect, useRef} from 'react';
import {monaco} from 'react-monaco-editor';

import {debounce} from 'lodash';

import {FileMapType, HelmChartMapType, HelmValuesMapType, ResourceFilterType, ResourceMapType} from '@models/appstate';
import {K8sResource, ResourceRef} from '@models/k8sresource';

import codeIntel from './codeIntel';
import {clearDecorations, setDecorations, setMarkers} from './editorHelpers';

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
          idsOfDecorationsRef.current = setDecorations(editor, newDecorations);
          disposablesRef.current = newDisposables;

          const model = editor.getModel();
          if (model) setMarkers(model, newMarkers);
        });
    } else if (currentFile?.helmChartId && code) {
      const {helmNewDisposables, helmNewDecorations} = codeIntel.applyForHelmFile({
        code,
        currentFile,
        helmChartMap,
        helmValuesMap,
        selectFilePath,
        fileMap,
      });
      idsOfDecorationsRef.current = setDecorations(editor, helmNewDecorations);
      disposablesRef.current = helmNewDisposables;
    }
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
