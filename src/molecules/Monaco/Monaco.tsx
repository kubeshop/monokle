import React, { useEffect, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { useAppSelector } from '../../redux/hooks';
import fs from 'fs';
import path from 'path';
import { monaco } from 'react-monaco-editor';
import { parseAllDocuments, stringify } from 'yaml';

const Monaco = () => {
  const rootFolder = useAppSelector(state => state.main.rootFolder);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const [editor, setEditor] = useState<monaco.editor.IEditor>();
  const [code, setCode] = useState('');

  // eslint-disable-next-line no-unused-vars
  function editorDidMount(editor: any, monaco: any) {
    console.log('editorDidMount', editor);
    setEditor(editor);
  }

  useEffect(() => {
    if (editor) {
      editor.revealLineNearTop(1);
      editor.setSelection(new monaco.Selection(0, 0, 0, 0));
    }
  }, [editor, code]);

  function onChange(newValue: any, e: any) {
    console.log('onChange', newValue, e);
  }

  useEffect(() => {
    let newCode = '';
    if (selectedPath) {
      const filePath = path.join(rootFolder, selectedPath);
      if (selectedResource && resourceMap[selectedResource]) {
        const resource = resourceMap[selectedResource];

        if (fs.statSync(filePath).isFile()) {
          // reparse since we can't save the parsed document object in the state (non-serializable)
          const documents = parseAllDocuments(fs.readFileSync(filePath, 'utf8'));
          if (documents && resource.docIndex < documents.length) {
            newCode = documents[resource.docIndex].toString();
          }
        }
      } else {
        const filePath = path.join(rootFolder, selectedPath);
        if (!fs.statSync(filePath).isDirectory()) {
          newCode = fs.readFileSync(filePath, 'utf8');
        }
      }
    } else if (selectedResource) {
      const resource = resourceMap[selectedResource];
      if (resource) {
        console.log(resource);
        newCode = stringify(resource.content);
      }
    }

    setCode(newCode);
  }, [rootFolder, selectedPath, selectedResource, resourceMap]);

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
