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
import {MonoButton} from '@atoms';

// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import EditorWorker from 'worker-loader!monaco-editor/esm/vs/editor/editor.worker';
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import YamlWorker from 'worker-loader!monaco-yaml/lib/esm/yaml.worker';
import {getResourceSchema} from '@redux/utils/schema';
import {logMessage} from '@redux/utils/log';
import {updateFileEntry, updateResource} from '@redux/reducers/main';
import {parseAllDocuments} from 'yaml';
import {ROOT_FILE_ENTRY} from '@src/constants';
import {KUBESHOP_MONACO_THEME} from "@utils/monaco";

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
  const fileMap = useAppSelector(state => state.main.fileMap);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const [editor, setEditor] = useState<monaco.editor.IEditor>();
  const [code, setCode] = useState('');
  const [ref, {width}] = useMeasure<HTMLDivElement>();
  const [isDirty, setDirty] = useState(false);
  const [hasWarnings, setWarnings] = useState(false);
  const [isValid, setValid] = useState(true);
  const isInPreviewMode = Boolean(useAppSelector(state => state.main.previewResource));
  const dispatch = useAppDispatch();

  function onDidChangeMarkers(e: monaco.Uri[]) {
    const flag = monaco.editor.getModelMarkers({}).length > 0;
    setWarnings(flag);
  }

  function onChangeCursorSelection(e: any) {
    // console.log(e);
  }

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

    // this will slow things down if document gets large - need to find a better solution...
    setValid(!parseAllDocuments(newValue).some(d => d.errors.length > 0));
  }

  function saveContent() {
    // @ts-ignore
    const value = editor.getValue();

    // is a file and no resource selected?
    if (selectedPath && !selectedResource) {
      try {
        dispatch(updateFileEntry({path: selectedPath, content: value}));
      } catch (e) {
        logMessage(`Failed to update file ${e}`, dispatch);
      }
    } else if (selectedResource && resourceMap[selectedResource]) {
      try {
        dispatch(updateResource({resourceId: selectedResource, content: value.toString()}));
      } catch (e) {
        logMessage(`Failed to update resource ${e}`, dispatch);
      }
    }
  }

  useEffect(() => {
    let newCode = '';
    if (selectedResource) {
      const resource = resourceMap[selectedResource];
      if (resource) {
        newCode = resource.text;
      }
    } else if (selectedPath && selectedPath !== fileMap[ROOT_FILE_ENTRY].filePath) {
      const filePath = path.join(fileMap[ROOT_FILE_ENTRY].filePath, selectedPath);
      if (!fs.statSync(filePath).isDirectory()) {
        newCode = fs.readFileSync(filePath, 'utf8');
      }
    }

    setCode(newCode);
    setDirty(false);
  }, [fileMap, selectedPath, selectedResource, resourceMap]);

  const options = {
    selectOnLineNumbers: true,
    readOnly: isInPreviewMode,
    fontWeight: "bold"
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

  useEffect(() => {
    if (editor) {
      editor.revealLineNearTop(1);
      editor.setSelection(new monaco.Selection(0, 0, 0, 0));
    }
  }, [editor, code]);

  return (
    <>
      <MonoButton large
        type={hasWarnings ? "dashed" : "primary"}
        disabled={!isDirty || !isValid}
        onClick={saveContent}
      >
        Save
      </MonoButton>
      <MonacoContainer ref={ref}>
        <MonacoEditor
          width={width}
          height={editorHeight}
          language="yaml"
          theme={KUBESHOP_MONACO_THEME}
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
