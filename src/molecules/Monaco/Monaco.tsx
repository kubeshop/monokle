import React, { useEffect, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { monaco } from 'react-monaco-editor';
import { useAppSelector } from '../../redux/hooks';
import fs from 'fs';
import path from 'path';

const Monaco = () => {
  const rootFolder = useAppSelector(state => state.main.rootFolder);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const [editor, setEditor] = useState();

  // eslint-disable-next-line no-unused-vars
  function editorDidMount(editor: any, monaco: any) {
    console.log('editorDidMount', editor);
    setEditor(editor);
  }

  useEffect(() => {
    if (editor && selectedResource && resourceMap[selectedResource]) {
      const resource = resourceMap[selectedResource];
      if (resource.linePos) {
        // @ts-ignore
        editor.revealLineNearTop(resource.linePos);
        // @ts-ignore
        editor.setSelection(new monaco.Range(resource.linePos, 0, resource.linePos + 1, 0));
      }
    }
  });

  function onChange(newValue: any, e: any) {
    console.log('onChange', newValue, e);
  }

  let code = '';
  if (selectedPath) {
    const filePath = path.join(rootFolder, selectedPath);
    if (!fs.statSync(filePath).isDirectory()) {
      code = fs.readFileSync(filePath, 'utf8');
    }
  }

  const options = {
    selectOnLineNumbers: true,
  };

  return (
    <MonacoEditor
      width='600'
      height='600'
      language='yaml'
      theme='vs-dark'
      value={code}
      options={options}
      onChange={onChange}
      editorDidMount={editorDidMount}
    />
  );

};

export default Monaco;
