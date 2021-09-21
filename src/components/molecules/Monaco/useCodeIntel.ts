import {useRef, useEffect} from 'react';
import {FileMapType, ResourceMapType} from '@models/appstate';
import {monaco} from 'react-monaco-editor';
import {clearDecorations, setDecorations} from './editorHelpers';
import codeIntel from './codeIntel';

function useCodeIntel(
  editor: monaco.editor.IStandaloneCodeEditor | null,
  code: string,
  selectedResourceId: string | undefined,
  resourceMap: ResourceMapType,
  fileMap: FileMapType,
  selectResource: (resourceId: string) => void,
  selectFilePath: (filePath: string) => void
) {
  const idsOfDecorationsRef = useRef<string[]>([]);
  const hoverDisposablesRef = useRef<monaco.IDisposable[]>([]);
  const commandDisposablesRef = useRef<monaco.IDisposable[]>([]);
  const linkDisposablesRef = useRef<monaco.IDisposable[]>([]);
  const completionDisposableRef = useRef<monaco.IDisposable | null>(null);

  const clearCodeIntel = () => {
    if (editor) {
      clearDecorations(editor, idsOfDecorationsRef.current);
    }
    hoverDisposablesRef.current.forEach(hoverDisposable => hoverDisposable.dispose());
    commandDisposablesRef.current.forEach(commandDisposable => commandDisposable.dispose());
    linkDisposablesRef.current.forEach(linkDisposable => linkDisposable.dispose());
  };

  const applyCodeIntel = () => {
    if (editor && selectedResourceId && resourceMap[selectedResourceId]) {
      const resource = resourceMap[selectedResourceId];
      const {newDecorations, newHoverDisposables, newCommandDisposables, newLinkDisposables} =
        codeIntel.applyForResource(resource, selectResource, selectFilePath, resourceMap, fileMap);
      const idsOfNewDecorations = setDecorations(editor, newDecorations, idsOfDecorationsRef.current);
      idsOfDecorationsRef.current = idsOfNewDecorations;
      hoverDisposablesRef.current = newHoverDisposables;
      commandDisposablesRef.current = newCommandDisposables;
      linkDisposablesRef.current = newLinkDisposables;
    }
  };

  useEffect(() => {
    clearCodeIntel();
    applyCodeIntel();

    return () => {
      clearCodeIntel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, selectedResourceId, resourceMap]);

  useEffect(() => {
    if (completionDisposableRef.current && completionDisposableRef.current.dispose) {
      completionDisposableRef.current.dispose();
    }
    if (editor) {
      const newCompletionDisposable = codeIntel.applyAutocomplete(resourceMap);
      completionDisposableRef.current = newCompletionDisposable;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResourceId, resourceMap]);
}

export default useCodeIntel;
