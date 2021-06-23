import React, {useEffect, useState} from 'react';
import MonacoEditor, {monaco} from 'react-monaco-editor';
import { useMeasure } from 'react-use';
import styled from 'styled-components';


const LogContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 0px;
  margin: 0px;
`;

const LogViewer = (props: {editorHeight: string}) => {
  const {editorHeight} = props;
  const [editor, setEditor] = useState<monaco.editor.IEditor>();
  const [code, setCode] = useState('loggyloggylog');
  const [ref, { width }] = useMeasure<HTMLDivElement>();

  function editorDidMount(e: any, m: any) {
    setEditor(e);
  }

  useEffect(() => {
    if (editor) {
      editor.revealLineNearTop(1);
      editor.setSelection(new monaco.Selection(0, 0, 0, 0));
    }
  }, [editor, code]);

  function onChange(newValue: any, e: any) {
    console.log('Logger onChange >>>SHOULD NOT BE CALLED<<<', newValue, e); // should never happen
  }


  const options = {
    selectOnLineNumbers: true,
    readOnly: true,
    lineNumbers: "off" as IStandaloneEditorConstructionOptions.LineNumbersType,
    roundedSelection: false,
    scrollBeyondLastLine: false,
  };

  /* tslint:disable-next-line */
  return (
    <LogContainer ref={ref}>
      <MonacoEditor
        width={width}
        height={editorHeight}
        language="yaml"
        theme="vs-light"
        value={code}
        options={options}
        onChange={onChange}
        editorDidMount={editorDidMount}
      />
    </LogContainer>
  );
};

export default LogViewer;
