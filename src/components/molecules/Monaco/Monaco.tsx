import React, {useEffect, useState, useRef, useMemo} from 'react';
import MonacoEditor, {monaco} from 'react-monaco-editor';
import fs from 'fs';
import path from 'path';
import {useMeasure} from 'react-use';
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
import {selectK8sResource, selectFile} from '@redux/reducers/main';
import {parseAllDocuments} from 'yaml';
import {ROOT_FILE_ENTRY} from '@constants/constants';
import {KUBESHOP_MONACO_THEME} from '@utils/monaco';
import {useSelector} from 'react-redux';
import {isInPreviewModeSelector} from '@redux/selectors';
import useCodeIntel from './useCodeIntel';
import useEditorKeybindings from './useEditorKeybindings';
import useResourceYamlSchema from './useResourceYamlSchema';
import useDebouncedCodeSave from './useDebouncedCodeSave';
import useEditorUiState from './useEditorUiState';
import * as S from './Monaco.styled';

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

// @ts-ignore
const {yaml} = languages || {};

const Monaco = (props: {editorHeight: string; diffSelectedResource: () => void; applySelection: () => void}) => {
  const {editorHeight, diffSelectedResource, applySelection} = props;
  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const previewResourceId = useAppSelector(state => state.main.previewResourceId);
  const selectedValuesFileId = useAppSelector(state => state.main.selectedValuesFileId);
  const previewValuesFileId = useAppSelector(state => state.main.previewValuesFileId);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const previewType = useAppSelector(state => state.main.previewType);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const [containerRef, {width}] = useMeasure<HTMLDivElement>();

  const [code, setCode] = useState('');
  const [orgCode, setOrgCode] = useState<string>('');
  const [isDirty, setDirty] = useState(false);
  const [hasWarnings, setWarnings] = useState(false);
  const [isValid, setValid] = useState(true);
  const [firstCodeLoadedOnEditor, setFirstCodeLoadedOnEditor] = useState(false);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  let editor = editorRef.current;
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const selectResource = (resourceId: string) => {
    if (resourceMap[resourceId]) {
      dispatch(selectK8sResource({resourceId}));
    }
  };

  const selectFilePath = (filePath: string) => {
    if (fileMap[filePath]) {
      dispatch(selectFile({filePath}));
    }
  };

  useCodeIntel(editor, code, selectedResourceId, resourceMap, fileMap, selectResource, selectFilePath);
  const {registerStaticActions} = useEditorKeybindings(
    editor,
    hiddenInputRef,
    fileMap,
    applySelection,
    diffSelectedResource
  );
  useResourceYamlSchema(yaml, resourceMap, selectedResourceId);
  useDebouncedCodeSave(
    editor,
    orgCode,
    code,
    isDirty,
    isValid,
    resourceMap,
    selectedResourceId,
    selectedPath,
    setOrgCode
  );
  const {onEditorFocus} = useEditorUiState(editor, selectedResourceId);

  const onDidChangeMarkers = (e: monaco.Uri[]) => {
    const flag = monaco.editor.getModelMarkers({}).length > 0;
    setWarnings(flag);
  };

  const onChangeCursorSelection = (e: any) => {
    // console.log(e);
  };

  const editorDidMount = (e: monaco.editor.IStandaloneCodeEditor) => {
    registerStaticActions(e);

    e.onDidFocusEditorText(onEditorFocus);

    editorRef.current = e as monaco.editor.IStandaloneCodeEditor;

    // @ts-ignore
    monaco.editor.onDidChangeMarkers(onDidChangeMarkers);

    e.updateOptions({tabSize: 2});
    e.onDidChangeCursorSelection(onChangeCursorSelection);
    e.revealLineNearTop(1);
    e.setSelection(new monaco.Selection(0, 0, 0, 0));
  };

  function onChange(newValue: any) {
    setDirty(orgCode !== newValue);
    setCode(newValue);

    // this will slow things down if document gets large - need to find a better solution...
    setValid(!parseAllDocuments(newValue).some(d => d.errors.length > 0));
  }

  useEffect(() => {
    if (!firstCodeLoadedOnEditor && code) {
      setFirstCodeLoadedOnEditor(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, selectedResourceId, resourceMap]);

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

  useEffect(() => {
    if (editor) {
      editor.revealLineNearTop(1);
      editor.setSelection(new monaco.Selection(0, 0, 0, 0));
    }
  }, [editor, selectedResourceId, firstCodeLoadedOnEditor]);

  // read-only if we're in preview mode and another resource is selected - or if nothing is selected at all
  const isReadOnlyMode = useMemo(() => {
    if (isInPreviewMode && selectedResourceId !== previewResourceId && previewType !== 'cluster') {
      return true;
    }
    if (selectedValuesFileId !== previewValuesFileId) {
      return true;
    }
    if (!selectedPath && !selectedResourceId) {
      return true;
    }
    return false;
  }, [
    isInPreviewMode,
    selectedResourceId,
    previewResourceId,
    selectedValuesFileId,
    previewValuesFileId,
    selectedPath,
    previewType,
  ]);

  const options = useMemo(
    () => ({
      selectOnLineNumbers: true,
      readOnly: isReadOnlyMode,
      fontWeight: 'bold',
      glyphMargin: true,
      minimap: {
        enabled: false,
      },
    }),
    [isReadOnlyMode]
  );

  return (
    <S.MonacoContainer ref={containerRef}>
      <S.HiddenInputContainer>
        <S.HiddenInput ref={hiddenInputRef} type="text" />
      </S.HiddenInputContainer>
      {firstCodeLoadedOnEditor && (
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
      )}
    </S.MonacoContainer>
  );
};
export default Monaco;
