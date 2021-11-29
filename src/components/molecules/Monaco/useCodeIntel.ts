import {useEffect, useRef} from 'react';
import {monaco} from 'react-monaco-editor';

import {FileMapType, ResourceFilterType, ResourceMapType} from '@models/appstate';
import {K8sResource, ResourceRef} from '@models/k8sresource';

import codeIntel from './codeIntel';
import {clearDecorations, setDecorations} from './editorHelpers';

function useCodeIntel(
  editor: monaco.editor.IStandaloneCodeEditor | null,
  selectedResource: K8sResource | undefined,
  code: string | undefined,
  resourceMap: ResourceMapType,
  fileMap: FileMapType,
  isEditorMounted: boolean,
  selectResource: (resourceId: string) => void,
  selectFilePath: (filePath: string) => void,
  createResource: ((outgoingRef: ResourceRef, namespace?: string, targetFolder?: string) => void) | undefined,
  filterResources: (filter: ResourceFilterType) => void
) {
  const idsOfDecorationsRef = useRef<string[]>([]);
  const disposablesRef = useRef<monaco.IDisposable[]>([]);
  const completionDisposableRef = useRef<monaco.IDisposable | null>(null);

  const clearCodeIntel = () => {
    if (editor) {
      clearDecorations(editor, idsOfDecorationsRef.current);
      idsOfDecorationsRef.current = [];
    }
    disposablesRef.current.forEach(disposable => disposable.dispose());
    disposablesRef.current = [];
  };

  const applyCodeIntel = () => {
    if (editor && selectedResource) {
      codeIntel
        .applyForResource(
          selectedResource,
          selectResource,
          selectFilePath,
          createResource,
          filterResources,
          resourceMap,
          fileMap,
          editor?.getModel()
        )
        .then(({newDecorations, newDisposables}) => {
          idsOfDecorationsRef.current = setDecorations(editor, newDecorations);
          disposablesRef.current = newDisposables;
        });
    }
  };

  useEffect(() => {
    clearCodeIntel();
    applyCodeIntel();

    return () => {
      clearCodeIntel();
    };
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
