import React, {useEffect, useState, useRef} from 'react';
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
import {getResourceSchema} from '@redux/services/schema';
import {logMessage} from '@redux/services/log';
import {updateFileEntry, updateResource, selectK8sResource} from '@redux/reducers/main';
import {parseAllDocuments} from 'yaml';
import {ROOT_FILE_ENTRY} from '@constants/constants';
import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import {useSelector} from 'react-redux';
import {isInPreviewModeSelector} from '@redux/selectors';
import {clearDecorations, setDecorations} from './editorHelpers';
import codeIntel from './codeIntel';

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

const HiddenInputContainer = styled.div`
  width: 0;
  height: 0;
  overflow: hidden;
`;

const HiddenInput = styled.input`
  opacity: 0;
`;

const MonacoButtons = styled.div`
  padding: 8px;
  padding-right: 8px;
  height: 40px;
`;

const MonacoContainer = styled.div`
  width: 100%;
  height: 100%;
  padding-left: 0px;
  padding-right: 8px;
  margin: 0px;
  margin-bottom: 20px;
`;

const RightMonoButton = styled(MonoButton)`
  float: right;
`;

// @ts-ignore
const {yaml} = languages || {};

const Monaco = (props: {editorHeight: string}) => {
  const {editorHeight} = props;
  const fileMap = useAppSelector(state => state.main.fileMap);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [code, setCode] = useState('');
  const [orgCode, setOrgCode] = useState<string>();
  const [containerRef, {width}] = useMeasure<HTMLDivElement>();
  const [isDirty, setDirty] = useState(false);
  const [hasWarnings, setWarnings] = useState(false);
  const [isValid, setValid] = useState(true);

  const idsOfDecorationsRef = useRef<string[]>([]);
  const hoverDisposablesRef = useRef<monaco.IDisposable[]>([]);
  const commandDisposablesRef = useRef<monaco.IDisposable[]>([]);
  const linkDisposablesRef = useRef<monaco.IDisposable[]>([]);
  const completionDisposableRef = useRef<monaco.IDisposable | null>(null);
  const actionSaveDisposableRef = useRef<monaco.IDisposable | null>(null);

  const editor = editorRef.current;

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const dispatch = useAppDispatch();

  const selectResource = (resourceId: string) => {
    dispatch(selectK8sResource(resourceId));
  };

  const onDidChangeMarkers = (e: monaco.Uri[]) => {
    const flag = monaco.editor.getModelMarkers({}).length > 0;
    setWarnings(flag);
  };

  const onChangeCursorSelection = (e: any) => {
    // console.log(e);
  };

  const editorDidMount = (e: any, m: any) => {
    // register action to exit editor focus
    e.addAction({
      id: 'monokle-exit-editor-focus',
      label: 'Exit Editor Focus',
      /* eslint-disable no-bitwise */
      keybindings: [monaco.KeyCode.Escape],
      run: () => {
        hiddenInputRef.current?.focus();
      },
    });

    editorRef.current = e as monaco.editor.IStandaloneCodeEditor;

    // @ts-ignore
    monaco.editor.onDidChangeMarkers(onDidChangeMarkers);

    e.updateOptions({tabSize: 2});
    e.onDidChangeCursorSelection(onChangeCursorSelection);
    e.revealLineNearTop(1);
    e.setSelection(new monaco.Selection(0, 0, 0, 0));
  };

  function onChange(newValue: any, e: any) {
    setDirty(orgCode !== newValue);
    setCode(newValue);

    // this will slow things down if document gets large - need to find a better solution...
    setValid(!parseAllDocuments(newValue).some(d => d.errors.length > 0));
  }

  const saveContent = (providedEditor?: monaco.editor.IStandaloneCodeEditor) => {
    let value = null;
    if (providedEditor) {
      value = providedEditor.getValue();
    } else if (editor) {
      value = editor.getValue();
    } else {
      return;
    }
    // is a file and no resource selected?
    if (selectedPath && !selectedResourceId) {
      try {
        dispatch(updateFileEntry({path: selectedPath, content: value}));
        setOrgCode(value);
      } catch (e) {
        logMessage(`Failed to update file ${e}`, dispatch);
      }
    } else if (selectedResourceId && resourceMap[selectedResourceId]) {
      try {
        dispatch(updateResource({resourceId: selectedResourceId, content: value.toString()}));
        setOrgCode(value);
      } catch (e) {
        logMessage(`Failed to update resource ${e}`, dispatch);
      }
    }
  };

  useEffect(() => {
    if (editor) {
      if (actionSaveDisposableRef.current && actionSaveDisposableRef.current.dispose) {
        actionSaveDisposableRef.current.dispose();
      }
      const newActionSaveDisposable = editor.addAction({
        id: 'monokle-save-content',
        label: 'Save Content',
        /* eslint-disable no-bitwise */
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
        run: currentEditor => {
          saveContent(currentEditor as monaco.editor.IStandaloneCodeEditor);
        },
      });
      actionSaveDisposableRef.current = newActionSaveDisposable;
    }
  }, [editor, selectedPath, selectedResourceId]);

  useEffect(() => {
    let newCode = '';
    if (selectedResourceId) {
      const resource = resourceMap[selectedResourceId];
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
    setOrgCode(newCode);
    setDirty(false);
  }, [fileMap, selectedPath, selectedResourceId, resourceMap]);

  const options = {
    selectOnLineNumbers: true,
    readOnly: isInPreviewMode || (!selectedPath && !selectedResourceId),
    fontWeight: 'bold',
    glyphMargin: true,
    minimap: {
      enabled: false,
    },
  };

  const clearCodeIntel = () => {
    if (editor) {
      clearDecorations(editor, idsOfDecorationsRef.current);
    }
    hoverDisposablesRef.current.forEach(hoverDisposable => hoverDisposable.dispose());
    commandDisposablesRef.current.forEach(commandDisposable => commandDisposable.dispose());
    linkDisposablesRef.current.forEach(linkDisposable => linkDisposable.dispose());
  };

  const applyCodeIntel = () => {
    if (editor && selectedResourceId && resourceMap[selectedResourceId]) {
      const resource = resourceMap[selectedResourceId];
      const {newDecorations, newHoverDisposables, newCommandDisposables, newLinkDisposables} =
        codeIntel.applyForResource(resource, selectResource, resourceMap);
      const idsOfNewDecorations = setDecorations(editor, newDecorations, idsOfDecorationsRef.current);
      idsOfDecorationsRef.current = idsOfNewDecorations;
      hoverDisposablesRef.current = newHoverDisposables;
      commandDisposablesRef.current = newCommandDisposables;
      linkDisposablesRef.current = newLinkDisposables;
    }
  };

  useEffect(() => {
    clearCodeIntel();
    applyCodeIntel();
    return () => {
      clearCodeIntel();
    };
  }, [code, selectedResourceId, resourceMap]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let resourceSchema;

    if (selectedResourceId) {
      const resource = resourceMap[selectedResourceId];
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
    if (completionDisposableRef.current && completionDisposableRef.current.dispose) {
      completionDisposableRef.current.dispose();
    }
    if (editor) {
      const newCompletionDisposable = codeIntel.applyAutocomplete(resourceMap);
      completionDisposableRef.current = newCompletionDisposable;
    }
  }, [selectedResourceId, resourceMap]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (editor) {
      editor.revealLineNearTop(1);
      editor.setSelection(new monaco.Selection(0, 0, 0, 0));
    }
  }, [editor, code]);

  return (
    <>
      <MonacoButtons>
        <HiddenInputContainer>
          <HiddenInput ref={hiddenInputRef} type="text" />
        </HiddenInputContainer>
        <RightMonoButton
          large="true"
          type={hasWarnings ? 'dashed' : 'primary'}
          disabled={!isDirty || !isValid}
          onClick={() => saveContent()}
        >
          Save
        </RightMonoButton>
      </MonacoButtons>
      <MonacoContainer ref={containerRef}>
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
