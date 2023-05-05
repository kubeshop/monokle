import {memo, useEffect} from 'react';
import {useEffectOnce, useMeasure} from 'react-use';

import 'monaco-yaml';

import {useAppDispatch} from '@redux/hooks';

import {editorMounted} from '@editor/editor.slice';

import {getEditor, mountEditor, unmountEditor} from '../editor.instance';
import * as S from './CodeEditor.styled';
import './handleCodeChanges';

window.MonacoEnvironment = {
  getWorker(moduleId, label) {
    switch (label) {
      case 'editorWorkerService':
        return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url));
      case 'json':
        return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url));
      case 'yaml':
        return new Worker(new URL('monaco-yaml/yaml.worker.js', import.meta.url));
      default:
        throw new Error(`Unknown label ${label}`);
    }
  },
};

type CodeEditorProps = {
  type: 'local' | 'cluster';
};

const CodeEditor = (props: CodeEditorProps) => {
  const {type} = props;
  const dispatch = useAppDispatch();
  const [containerRef, dimensions] = useMeasure<HTMLDivElement>();

  useEffectOnce(() => {
    mountEditor({element: document.getElementById('monokle-monaco')!, type});
    dispatch(editorMounted());
    return () => unmountEditor();
  });

  useEffect(() => {
    const editor = getEditor();
    if (!editor) return;
    editor.layout(dimensions);
  }, [dimensions]);

  return (
    <S.MonacoContainer ref={containerRef}>
      <div id="monokle-monaco" />
    </S.MonacoContainer>
  );
};

export default memo(CodeEditor);
