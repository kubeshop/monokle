import React, {useEffect, useState} from 'react';
import MonacoEditor, {monaco} from 'react-monaco-editor';
import {useMeasure} from 'react-use';
import {useSelector} from 'react-redux';
import styled from 'styled-components';

import {selectLogs} from '@redux/selectors';

const LogContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 0px;
  margin: 0px;
`;

type LineNumbersType = 'on' | 'off' | 'relative' | 'interval' | ((lineNumber: number) => string);

// from https://github.com/microsoft/monaco-editor/blob/8f6ebdc/typedoc/monaco.d.ts#L3632
interface IEditorMinimapOptions {
  /**
   * Enable the rendering of the minimap.
   * Defaults to true.
   */
  enabled?: boolean;
  /**
   * Control the side of the minimap in editor.
   * Defaults to 'right'.
   */
  side?: 'right' | 'left';
  /**
   * Control the minimap rendering mode.
   * Defaults to 'actual'.
   */
  size?: 'proportional' | 'fill' | 'fit';
  /**
   * Control the rendering of the minimap slider.
   * Defaults to 'mouseover'.
   */
  showSlider?: 'always' | 'mouseover';
  /**
   * Render the actual text on a line (as opposed to color blocks).
   * Defaults to true.
   */
  renderCharacters?: boolean;
  /**
   * Limit the width of the minimap to render at most a certain number of columns.
   * Defaults to 120.
   */
  maxColumn?: number;
  /**
   * Relative size of the font in the minimap. Defaults to 1.
   */
  scale?: number;
}
type EditorMinimapOptions = Readonly<Required<IEditorMinimapOptions>>;

const LogViewer = (props: {editorHeight: string}) => {
  const {editorHeight} = props;
  const [editor, setEditor] = useState<monaco.editor.IEditor>();
  const code = useSelector(selectLogs);
  const [ref, {width}] = useMeasure<HTMLDivElement>();

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
    lineNumbers: 'off' as LineNumbersType,
    minimap: {
      enabled: false,
    } as EditorMinimapOptions,
    roundedSelection: false,
    scrollBeyondLastLine: false,
  };

  /* tslint:disable-next-line */
  return (
    <LogContainer ref={ref}>
      <MonacoEditor
        width={width}
        height={editorHeight}
        language="plaintext"
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
