/* eslint-disable import/order */
import React, {useEffect, useMemo, useRef, useState} from 'react';
import MonacoEditor, {monaco} from 'react-monaco-editor';
import {useSelector} from 'react-redux';
import {useMeasure} from 'react-use';

import fs from 'fs';
import 'monaco-editor';
// @ts-ignore
import {languages} from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-yaml/lib/esm/monaco.contribution';
import path from 'path';
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import EditorWorker from 'worker-loader!monaco-editor/esm/vs/editor/editor.worker';
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import YamlWorker from 'worker-loader!monaco-yaml/lib/esm/yaml.worker';
import {Document, ParsedNode, isMap, parseAllDocuments} from 'yaml';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile, selectK8sResource} from '@redux/reducers/main';
import {isInPreviewModeSelector} from '@redux/selectors';

import useResourceYamlSchema from '@hooks/useResourceYamlSchema';

import {getFileStats} from '@utils/files';
import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import * as S from './Monaco.styled';
import useCodeIntel from './useCodeIntel';
import useDebouncedCodeSave from './useDebouncedCodeSave';
import useEditorKeybindings from './useEditorKeybindings';
import useMonacoUiState from './useMonacoUiState';

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

function isValidResourceDocument(d: Document.Parsed<ParsedNode>) {
  return (
    // @ts-ignore
    d.errors.length === 0 && d.contents && isMap(d.contents) && d.contents.has('apiVersion') && d.contents.has('kind')
  );
}

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
  const [containerRef, {width: containerWidth, height: containerHeight}] = useMeasure<HTMLDivElement>();

  const [code, setCode] = useState('');
  const [orgCode, setOrgCode] = useState<string>('');
  const [isDirty, setDirty] = useState(false);
  const [hasWarnings, setWarnings] = useState(false);
  const [isValid, setValid] = useState(true);
  const [firstCodeLoadedOnEditor, setFirstCodeLoadedOnEditor] = useState(false);
  const [isEditorMounted, setEditorMounted] = useState(false);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [editor, setEditor] = useState(editorRef.current);

  const selectedResource = useMemo(() => {
    return selectedResourceId ? resourceMap[selectedResourceId] : undefined;
  }, [selectedResourceId, resourceMap]);

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

  useCodeIntel(editor, code, selectedResourceId, resourceMap, fileMap, isEditorMounted, selectResource, selectFilePath);
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
  useMonacoUiState(editor, selectedResourceId, selectedPath);

  const onDidChangeMarkers = (e: monaco.Uri[]) => {
    const flag = monaco.editor.getModelMarkers({}).length > 0;
    setWarnings(flag);
  };

  const onChangeCursorSelection = (e: any) => {
    // console.log(e);
  };

  const editorDidMount = (e: monaco.editor.IStandaloneCodeEditor) => {
    registerStaticActions(e);

    // e.onDidFocusEditorText(onEditorFocus);

    editorRef.current = e as monaco.editor.IStandaloneCodeEditor;
    setEditor(e);

    // @ts-ignore
    monaco.editor.onDidChangeMarkers(onDidChangeMarkers);

    e.updateOptions({tabSize: 2, scrollBeyondLastLine: false});
    e.onDidChangeCursorSelection(onChangeCursorSelection);
    e.revealLineNearTop(1);
    e.setSelection(new monaco.Selection(0, 0, 0, 0));
    setEditorMounted(true);
  };

  const onChange = (newValue: any) => {
    setDirty(orgCode !== newValue);
    setCode(newValue);

    if (selectedResourceId) {
      // this will slow things down if document gets large - need to find a better solution...
      const documents = parseAllDocuments(newValue);
      setValid(documents.length > 0 && !documents.some(d => !isValidResourceDocument(d)));
    } else {
      setValid(true);
    }
  };

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
        editor?.setModel(monaco.editor.createModel(newCode, 'yaml'));
      }
    } else if (selectedPath && selectedPath !== fileMap[ROOT_FILE_ENTRY].filePath) {
      const filePath = path.join(fileMap[ROOT_FILE_ENTRY].filePath, selectedPath);
      const fileStats = getFileStats(filePath);
      if (fileStats && fileStats.isFile()) {
        newCode = fs.readFileSync(filePath, 'utf8');
      }
    }

    setCode(newCode);
    setOrgCode(newCode);
    setDirty(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPath, selectedResourceId]);

  useEffect(() => {
    if (selectedResource && selectedResource.text !== code) {
      setCode(selectedResource.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResource]);

  useEffect(() => {
    if (editor) {
      editor.revealLineNearTop(1);
      editor.setSelection(new monaco.Selection(0, 0, 0, 0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, selectedResourceId, firstCodeLoadedOnEditor]);

  // read-only if we're in preview mode and another resource is selected - or if nothing is selected at all
  const isReadOnlyMode = useMemo(() => {
    if (isInPreviewMode && selectedResourceId !== previewResourceId && previewType !== 'cluster') {
      return true;
    }
    if (isInPreviewMode && selectedValuesFileId !== previewValuesFileId) {
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
          width={containerWidth}
          height={containerHeight}
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
