/* eslint-disable import/order */
import React, {useEffect, useMemo, useRef, useState} from 'react';
import MonacoEditor, {monaco} from 'react-monaco-editor';
import {useSelector} from 'react-redux';
import {useMeasure} from 'react-use';

import fs from 'fs';
import log from 'loglevel';
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
import {Document, ParsedNode, isMap} from 'yaml';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {ResourceFilterType} from '@models/appstate';
import {ResourceRef} from '@models/k8sresource';
import {NewResourceWizardInput} from '@models/ui';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {editorHasReloadedSelectedPath, extendResourceFilter, selectFile, selectK8sResource} from '@redux/reducers/main';
import {openNewResourceWizard} from '@redux/reducers/ui';
import {isInPreviewModeSelector} from '@redux/selectors';
import {getResourcesForPath} from '@redux/services/fileEntry';
import {isKustomizationPatch} from '@redux/services/kustomize';

import useResourceYamlSchema from '@hooks/useResourceYamlSchema';

import {getFileStats} from '@utils/files';
import {KUBESHOP_MONACO_THEME} from '@utils/monaco';
import {parseAllYamlDocuments} from '@utils/yaml';

import {getResourceKindHandler} from '@src/kindhandlers';

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
  return d.errors.length === 0 && isMap(d.contents);
}

const Monaco = (props: {diffSelectedResource: () => void; applySelection: () => void}) => {
  const {diffSelectedResource, applySelection} = props;
  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const previewResourceId = useAppSelector(state => state.main.previewResourceId);
  const selectedValuesFileId = useAppSelector(state => state.main.selectedValuesFileId);
  const previewValuesFileId = useAppSelector(state => state.main.previewValuesFileId);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const previewType = useAppSelector(state => state.main.previewType);
  const shouldEditorReloadSelectedPath = useAppSelector(state => state.main.shouldEditorReloadSelectedPath);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);

  const resourcesFromSelectedPath = useMemo(() => {
    if (!selectedPath) {
      return [];
    }
    return getResourcesForPath(selectedPath, resourceMap);
  }, [selectedPath, resourceMap]);

  const [containerRef, {width: containerWidth, height: containerHeight}] = useMeasure<HTMLDivElement>();

  const [code, setCode] = useState('');
  const [orgCode, setOrgCode] = useState<string>('');
  const [isDirty, setDirty] = useState(false);
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

  const filterResources = (filter: ResourceFilterType) => {
    dispatch(extendResourceFilter(filter));
  };

  const createResource = (outoingRef: ResourceRef, namespace?: string, targetFolder?: string) => {
    if (outoingRef.target?.type === 'resource') {
      const input: NewResourceWizardInput = {
        name: outoingRef.name,
        namespace,
        apiVersion: outoingRef.target?.resourceKind
          ? getResourceKindHandler(outoingRef.target.resourceKind)?.clusterApiVersion
          : undefined,
        kind: outoingRef.target?.resourceKind,
        targetFolder,
      };

      dispatch(openNewResourceWizard({defaultInput: input}));
    }
  };

  useCodeIntel(
    editor,
    selectedResource || (resourcesFromSelectedPath.length === 1 ? resourcesFromSelectedPath[0] : undefined),
    code,
    resourceMap,
    fileMap,
    isEditorMounted,
    selectResource,
    selectFilePath,
    isInPreviewMode ? undefined : createResource,
    filterResources
  );

  const {registerStaticActions} = useEditorKeybindings(
    editor,
    hiddenInputRef,
    fileMap,
    applySelection,
    diffSelectedResource
  );

  useResourceYamlSchema(
    yaml,
    selectedResource || (resourcesFromSelectedPath.length === 1 ? resourcesFromSelectedPath[0] : undefined),
    selectedPath,
    fileMap
  );

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

  const editorDidMount = (e: monaco.editor.IStandaloneCodeEditor) => {
    registerStaticActions(e);

    editorRef.current = e as monaco.editor.IStandaloneCodeEditor;
    setEditor(e);

    e.updateOptions({tabSize: 2, scrollBeyondLastLine: false});
    e.revealLineNearTop(1);
    e.setSelection(new monaco.Selection(0, 0, 0, 0));
    setEditorMounted(true);
  };

  const onChange = (newValue: any) => {
    setDirty(orgCode !== newValue);
    setCode(newValue);

    if (selectedResourceId) {
      // this will slow things down if document gets large - need to find a better solution...
      const documents = parseAllYamlDocuments(newValue);
      // only accept single document changes for now
      setValid(documents.length === 1 && isValidResourceDocument(documents[0]));
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
    if (!selectedPath || !shouldEditorReloadSelectedPath) {
      return;
    }
    log.info('[Monaco]: selected file was updated outside Monokle - reading file...');
    const filePath = path.join(fileMap[ROOT_FILE_ENTRY].filePath, selectedPath);
    const fileStats = getFileStats(filePath);
    if (fileStats && fileStats.isFile()) {
      const newCode = fs.readFileSync(filePath, 'utf8');
      setCode(newCode);
      setOrgCode(newCode);
      setDirty(false);
      dispatch(editorHasReloadedSelectedPath());
    } else {
      log.warn('[Monaco]: selected file was updated outside Monokle - unable to read file');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldEditorReloadSelectedPath]);

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
      return previewType !== 'kustomization' || !isKustomizationPatch(selectedResource);
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
    selectedResource,
    previewResourceId,
    selectedValuesFileId,
    previewValuesFileId,
    selectedPath,
    previewType,
  ]);

  const options = useMemo(() => {
    const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
      selectOnLineNumbers: true,
      readOnly: isReadOnlyMode,
      renderValidationDecorations: 'on',
      fontWeight: 'bold',
      glyphMargin: true,
      minimap: {
        enabled: false,
      },
    };
    return editorOptions;
  }, [isReadOnlyMode]);

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
