import React, {useEffect, useState} from 'react';
import MonacoEditor, {monaco} from 'react-monaco-editor';
import fs from 'fs';
import path from 'path';
import {useMeasure} from 'react-use';
import styled from 'styled-components';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import 'monaco-yaml/lib/esm/monaco.contribution';
import {languages} from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor';

// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import EditorWorker from 'worker-loader!monaco-editor/esm/vs/editor/editor.worker';
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import YamlWorker from 'worker-loader!monaco-yaml/lib/esm/yaml.worker';
import {getResourceSchema} from '@redux/utils/schema';
import {Button} from 'react-bootstrap';
import {logMessage} from '@redux/utils/log';
import {setResourceContent} from '@redux/reducers/main';
import {K8sResource} from '@models/k8sresource';
import {AppDispatch} from '@redux/store';

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

function updateResourceInFile(filePath: string, resource: K8sResource, value: string, dispatch: AppDispatch) {
  if (fs.statSync(filePath).isFile()) {
    if (resource.range) {
      const content = fs.readFileSync(filePath, 'utf8');
      fs.writeFileSync(filePath, content.substr(0, resource.range[0]) + value + content.substr(resource.range[1]));
      logMessage(`Updated file ${filePath}`, dispatch);
    } else {
      // only document => just write to file
      fs.writeFileSync(filePath, value);
      logMessage(`Updated file ${filePath}`, dispatch);
    }
  }
}

const Monaco = (props: {editorHeight: string}) => {
  const {editorHeight} = props;
  const rootFolder = useAppSelector(state => state.main.rootFolder);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const [editor, setEditor] = useState<monaco.editor.IEditor>();
  const [code, setCode] = useState('');
  const [ref, {width}] = useMeasure<HTMLDivElement>();
  const [isDirty, setDirty] = useState(false);
  const [isInvalid, setInvalid] = useState(false);
  const dispatch = useAppDispatch();

  function editorDidMount(e: any, m: any) {
    setEditor(e);

    // @ts-ignore
    monaco.editor.onDidChangeMarkers(onDidChangeMarkers);

    e.updateOptions({tabSize: 2});
    e.onDidChangeCursorSelection(onChangeCursorSelection);
    e.revealLineNearTop(1);
    e.setSelection(new monaco.Selection(0, 0, 0, 0));
  }

  function onChange(newValue: any, e: any) {
    setDirty(true);
    setCode(newValue);
  }

  function onDidChangeMarkers(e: monaco.Uri[]) {
    setInvalid(monaco.editor.getModelMarkers({}).length > 0);
  }

  function onChangeCursorSelection(e: any) {
    // console.log(e);
  }

  function saveContent() {
    // @ts-ignore
    const value = editor.getValue();

    // is a file selected?
    if (selectedPath) {
      const filePath = path.join(rootFolder, selectedPath);
      if (selectedResource && resourceMap[selectedResource]) {
        const resource = resourceMap[selectedResource];
        updateResourceInFile(filePath, resource, value, dispatch);
      } else if (!fs.statSync(filePath).isDirectory()) {
        fs.writeFileSync(filePath, value);
        logMessage(`Updated file ${filePath}`, dispatch);
      }
    } else if (selectedResource && resourceMap[selectedResource]) {
      const resource = resourceMap[selectedResource];
      const filePath = path.join(rootFolder, resource.path);
      updateResourceInFile(filePath, resource, value, dispatch);
    }

    if (selectedResource) {
      dispatch(setResourceContent({resourceId: selectedResource, content: value}));
    }
  }

  useEffect(() => {
    let newCode = '';
    if (selectedResource) {
      const resource = resourceMap[selectedResource];
      if (resource) {
        newCode = resource.text;
      }
    } else if (selectedPath) {
      const filePath = path.join(rootFolder, selectedPath);
      const p = path.join(rootFolder, selectedPath);
      if (!fs.statSync(p).isDirectory()) {
        newCode = fs.readFileSync(p, 'utf8');
      }
    }

    setCode(newCode);
    setDirty(false);
  }, [rootFolder, selectedPath, selectedResource, resourceMap]);

  const options = {
    selectOnLineNumbers: true,
  };

  useEffect(() => {
    let resourceSchema;

    if (selectedResource) {
      const resource = resourceMap[selectedResource];
      if (resource) {
        resourceSchema = getResourceSchema(resource);
      }
    }

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
            schema: resourceSchema || {},
          },
        ],
      });
  }, [selectedResource, resourceMap]);

  return (
    <>
      <Button variant="outline-dark" size="sm" disabled={!isDirty || isInvalid} onClick={saveContent}>
        Save Changes
      </Button>
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
    </>
  );
};
export default Monaco;
