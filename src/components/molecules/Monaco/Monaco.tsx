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
import {inPreviewMode} from '@redux/selectors';
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
  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>();
  const [code, setCode] = useState('');
  const [orgCode, setOrgCode] = useState<string>();
  const [containerRef, {width}] = useMeasure<HTMLDivElement>();
  const [isDirty, setDirty] = useState(false);
  const [hasWarnings, setWarnings] = useState(false);
  const [isValid, setValid] = useState(true);

  const [currentIdsOfDecorations, setCurrentIdsOfDecorations] = useState<string[]>([]);
  const [currentHoverDisposables, setCurrentHoverDisposables] = useState<monaco.IDisposable[]>([]);
  const [currentCommandDisposables, setCurrentCommandDisposables] = useState<monaco.IDisposable[]>([]);
  const [currentLinkDisposables, setCurrentLinkDisposables] = useState<monaco.IDisposable[]>([]);
  const [currentCompletionDisposable, setCurrentCompletionDisposable] = useState<monaco.IDisposable>();
  const [actionSaveDisposable, setActionSaveDisposable] = useState<monaco.IDisposable>();

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const isInPreviewMode = useSelector(inPreviewMode);
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

    setEditor(e);

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
    if (selectedPath && !selectedResource) {
      try {
        dispatch(updateFileEntry({path: selectedPath, content: value}));
        setOrgCode(value);
      } catch (e) {
        logMessage(`Failed to update file ${e}`, dispatch);
      }
    } else if (selectedResource && resourceMap[selectedResource]) {
      try {
        dispatch(updateResource({resourceId: selectedResource, content: value.toString()}));
        setOrgCode(value);
      } catch (e) {
        logMessage(`Failed to update resource ${e}`, dispatch);
      }
    }
  };

  useEffect(() => {
    if (editor) {
      actionSaveDisposable?.dispose();
      const newActionSaveDisposable = editor.addAction({
        id: 'monokle-save-content',
        label: 'Save Content',
        /* eslint-disable no-bitwise */
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
        run: currentEditor => {
          saveContent(currentEditor as monaco.editor.IStandaloneCodeEditor);
        },
      });
      setActionSaveDisposable(newActionSaveDisposable);
    }
  }, [editor, selectedPath, selectedResource]);

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
    setOrgCode(newCode);
    setDirty(false);
  }, [fileMap, selectedPath, selectedResource, resourceMap]);

  const options = {
    selectOnLineNumbers: true,
    readOnly: isInPreviewMode || (!selectedPath && !selectedResource),
    fontWeight: 'bold',
    glyphMargin: true,
    minimap: {
      enabled: false,
    },
  };

  const clearCodeIntel = () => {
    if (editor) {
      clearDecorations(editor, currentIdsOfDecorations);
      currentHoverDisposables.forEach(hoverDisposable => hoverDisposable.dispose());
      currentCommandDisposables.forEach(commandDisposable => commandDisposable.dispose());
      currentLinkDisposables.forEach(linkDisposable => linkDisposable.dispose());
    }
  };

  const applyCodeIntel = () => {
    if (editor && selectedResource && resourceMap[selectedResource]) {
      const resource = resourceMap[selectedResource];
      const {newDecorations, newHoverDisposables, newCommandDisposables, newLinkDisposables} =
        codeIntel.applyForResource(resource, selectResource, resourceMap);
      const idsOfNewDecorations = setDecorations(editor, newDecorations);
      setCurrentIdsOfDecorations(idsOfNewDecorations);
      setCurrentHoverDisposables(newHoverDisposables);
      setCurrentCommandDisposables(newCommandDisposables);
      setCurrentLinkDisposables(newLinkDisposables);
    }
  };

  useEffect(() => {
    clearCodeIntel();
    applyCodeIntel();
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (currentCompletionDisposable) {
      currentCompletionDisposable.dispose();
    }
    if (editor) {
      const newCompletionDisposable = codeIntel.applyAutocomplete(resourceMap);
      setCurrentCompletionDisposable(newCompletionDisposable);
    }
  }, [selectedResource, resourceMap]); // eslint-disable-line react-hooks/exhaustive-deps

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
