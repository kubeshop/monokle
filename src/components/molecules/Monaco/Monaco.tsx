import React, {useEffect, useState} from 'react';
import MonacoEditor, {monaco} from 'react-monaco-editor';
import fs from 'fs';
import path from 'path';
import {parseAllDocuments, stringify} from 'yaml';
import {useMeasure} from 'react-use';
import styled from 'styled-components';

import {PREVIEW_PREFIX} from '@src/constants';
import {useAppSelector} from '@redux/hooks';

import 'monaco-yaml/lib/esm/monaco.contribution';
import {languages} from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor';

// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import EditorWorker from 'worker-loader!monaco-editor/esm/vs/editor/editor.worker';
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import YamlWorker from 'worker-loader!monaco-yaml/lib/esm/yaml.worker';
import {loadResource} from '@redux/utils/fileEntry';
import {isKustomizationResource} from '@redux/utils/resource';
import {JSONPath} from 'jsonpath-plus';
import {getResourceSchema} from '@redux/utils/schema';

// @ts-ignore
window.MonacoEnvironment = {
  // @ts-ignore
  getWorker(workerId, label) {
    if (label === 'yaml') {
      return new YamlWorker();
    }
    return new EditorWorker();
  },
};

const MonacoContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 0px;
  margin: 0px;
`;

// @ts-ignore
const {yaml} = languages || {};

const Monaco = (props: {editorHeight: string}) => {
  const {editorHeight} = props;
  const rootFolder = useAppSelector(state => state.main.rootFolder);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const [editor, setEditor] = useState<monaco.editor.IEditor>();
  const [code, setCode] = useState('p1: ');
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

  useEffect(() => {
    if (selectedResource && resourceMap[selectedResource]) {
      const resource = resourceMap[selectedResource];
      const schema = getResourceSchema(resource);

      yaml &&
        yaml.yamlDefaults.setDiagnosticsOptions({
          validate: true,
          enableSchemaRequest: true,
          hover: true,
          completion: true,
          isKubernetes: true,
          format: true,
          schemas: [
            {
              uri: 'http://monokle/k8s.json', // id of the first schema
              fileMatch: ['*'], // associate with our model
              schema,
            },
          ],
        });
    }
  }, [selectedResource, resourceMap]);

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
