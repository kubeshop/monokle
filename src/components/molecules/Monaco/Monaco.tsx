import React, {useEffect, useState} from 'react';
import MonacoEditor, {monaco} from 'react-monaco-editor';
import fs from 'fs';
import path from 'path';
import {parseAllDocuments, stringify} from 'yaml';
import { useMeasure } from 'react-use';
import styled from 'styled-components';

import {PREVIEW_PREFIX} from '@src/constants';
import {useAppSelector} from '@redux/hooks';

const MonacoContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 0px;
  margin: 0px;
`;

const Monaco = (props: {editorHeight: string}) => {
  const {editorHeight} = props;
  const rootFolder = useAppSelector(state => state.main.rootFolder);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const [editor, setEditor] = useState<monaco.editor.IEditor>();
  const [code, setCode] = useState('');
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
        const p = path.join(rootFolder, selectedPath);
        if (!fs.statSync(p).isDirectory()) {
          newCode = fs.readFileSync(p, 'utf8');
        }
      }
    } else if (selectedResource) {
      const resource = resourceMap[selectedResource];
      if (resource) {
        newCode = stringify(resource.content);
      }
    }

    setCode(newCode);
  }, [rootFolder, selectedPath, selectedResource, resourceMap]);

  const options = {
    selectOnLineNumbers: true,
    readOnly: selectedResource !== undefined && resourceMap[selectedResource].path.startsWith(PREVIEW_PREFIX),
  };

  /* tslint:disable-next-line */
  return (
    <MonacoContainer ref={ref}>
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
    </MonacoContainer>
  );
};

export default Monaco;
