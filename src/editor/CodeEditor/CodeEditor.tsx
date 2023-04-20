import {memo, useEffect} from 'react';
import {useEffectOnce, useMeasure} from 'react-use';

import {getEditor, mountEditor, unmountEditor} from '../editor.instance';
import * as S from './CodeEditor.styled';
import './handleCodeChanges';

const CodeEditor = () => {
  const [containerRef, dimensions] = useMeasure<HTMLDivElement>();

  useEffectOnce(() => {
    mountEditor(document.getElementById('monokle-monaco')!);
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
