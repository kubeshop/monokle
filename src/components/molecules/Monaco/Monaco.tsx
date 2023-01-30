/* eslint-disable import/order */
import {useEffect, useMemo, useRef, useState} from 'react';
import MonacoEditor, {monaco} from 'react-monaco-editor';
import {useMeasure} from 'react-use';

import fs from 'fs';
import log from 'loglevel';
// eslint-disable-next-line import/no-duplicates
import 'monaco-editor';
// eslint-disable-next-line import/no-duplicates
import {Uri} from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-yaml';
import path from 'path';
import {Document, ParsedNode, isMap} from 'yaml';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  editorHasReloadedSelectedPath,
  extendResourceFilter,
  selectFile,
  selectImage,
  selectResource,
  setAutosavingStatus,
  setLastChangedLine,
} from '@redux/reducers/main';
import {openNewResourceWizard} from '@redux/reducers/ui';
import {
  activeResourceContentMapSelector,
  activeResourceMetaMapSelector,
  isInClusterModeSelector,
  isInPreviewModeSelectorNew,
  resourceContentMapSelector,
  resourceMetaMapSelector,
  resourceSelector,
  selectedFilePathSelector,
  selectedResourceSelector,
  settingsSelector,
} from '@redux/selectors';
import {getLocalResourcesForPath} from '@redux/services/fileEntry';

import useResourceYamlSchema from '@hooks/useResourceYamlSchema';

import {getFileStats} from '@utils/files';
import {KUBESHOP_MONACO_THEME} from '@utils/monaco';
import {parseAllYamlDocuments} from '@utils/yaml';

import {getResourceKindHandler} from '@src/kindhandlers';

import {ResourceRef} from '@monokle/validation';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {ResourceFilterType} from '@shared/models/appState';
import {ResourceStorageKey} from '@shared/models/k8sResource';
import {isHelmPreview} from '@shared/models/preview';
import {ResourceSelection, isHelmValuesFileSelection} from '@shared/models/selection';
import {NewResourceWizardInput} from '@shared/models/ui';

import * as S from './Monaco.styled';
import useCodeIntel from './useCodeIntel';
import useDebouncedCodeSave from './useDebouncedCodeSave';
import useEditorKeybindings from './useEditorKeybindings';
import useMonacoUiState from './useMonacoUiState';

window.MonacoEnvironment = {
  getWorker(moduleId, label) {
    switch (label) {
      case 'editorWorkerService':
        return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url));
      case 'json':
        return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url));
      case 'yaml':
        return new Worker(new URL('monaco-yaml/yaml.worker.js', import.meta.url));
      default:
        throw new Error(`Unknown label ${label}`);
    }
  },
};

function isValidResourceDocument(d: Document.Parsed<ParsedNode>) {
  return d.errors.length === 0 && isMap(d.contents);
}

const Monaco = (props: {
  diffSelectedResource: () => void;
  applySelection: () => void;
  providedResourceSelection?: ResourceSelection;
}) => {
  const {diffSelectedResource, applySelection, providedResourceSelection} = props;
  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const helmTemplatesMap = useAppSelector(state => state.main.helmTemplatesMap);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const imagesList = useAppSelector(state => state.main.imagesList);
  const autosavingStatus = useAppSelector(state => state.main.autosaving.status);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const k8sVersion = useAppSelector(state => state.config.projectConfig?.k8sVersion);
  const preview = useAppSelector(state => state.main.preview);
  const activeResourceMetaMap = useAppSelector(activeResourceMetaMapSelector);
  const activeResourceContentMap = useAppSelector(activeResourceContentMapSelector);
  const localResourceMetaMap = useAppSelector(state => resourceMetaMapSelector(state, 'local'));
  const localResourceContentMap = useAppSelector(state => resourceContentMapSelector(state, 'local'));
  const selectedFilePath = useAppSelector(selectedFilePathSelector);
  const matchOptions = useAppSelector(state => state.main.search?.currentMatch);
  const lastChangedLine = useAppSelector(state => state.main.lastChangedLine);
  const selection = useAppSelector(state => state.main.selection);
  const settings = useAppSelector(settingsSelector);
  const shouldEditorReloadSelection = useAppSelector(state => state.main.selectionOptions.shouldEditorReload);
  const userDataDir = useAppSelector(state => state.config.userDataDir);
  const selectedResource = useAppSelector(state =>
    providedResourceSelection ? resourceSelector(state, providedResourceSelection) : selectedResourceSelector(state)
  );
  const selectedResourceId = selectedResource?.id;

  const resourcesFromSelectedPath = useMemo(() => {
    if (!selectedFilePath) {
      return [];
    }
    return getLocalResourcesForPath(selectedFilePath, {
      resourceMetaMap: localResourceMetaMap,
      resourceContentMap: localResourceContentMap,
    });
  }, [selectedFilePath, localResourceMetaMap, localResourceContentMap]);

  const [containerRef, {width: containerWidth, height: containerHeight}] = useMeasure<HTMLDivElement>();

  const [code, setCode] = useState('');
  const [orgCode, setOrgCode] = useState<string>('');
  const [isDirty, setDirty] = useState(false);
  const [isValid, setValid] = useState(true);
  const [firstCodeLoadedOnEditor, setFirstCodeLoadedOnEditor] = useState(false);
  const [isEditorMounted, setEditorMounted] = useState(false);

  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);

  const triggerSelectResource = (resourceId: string, resourceStorage: ResourceStorageKey) => {
    dispatch(selectResource({resourceId, resourceStorage}));
  };

  const selectFilePath = (filePath: string) => {
    if (fileMap[filePath]) {
      dispatch(selectFile({filePath}));
    }
  };

  const filterResources = (filter: ResourceFilterType) => {
    dispatch(extendResourceFilter(filter));
  };

  const selectImageHandler = (imageId: string) => {
    const image = imagesList.find(im => im.id === imageId);

    if (image) {
      dispatch(selectImage({imageId: image.id}));
    }
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

  useCodeIntel({
    editor,
    selectedResource:
      selectedResource || (resourcesFromSelectedPath.length === 1 ? resourcesFromSelectedPath[0] : undefined),
    code,
    resourceMetaMap: activeResourceMetaMap,
    fileMap,
    imagesList,
    isEditorMounted,
    selectResource: triggerSelectResource,
    selectFilePath,
    createResource: isInPreviewMode ? undefined : createResource,
    filterResources,
    selectImageHandler,
    selectedPath: selectedFilePath,
    helmValuesMap,
    helmChartMap,
    helmTemplatesMap,
    matchOptions,
    isDirty,
  });

  const {registerStaticActions} = useEditorKeybindings(
    editor,
    hiddenInputRef,
    fileMap,
    applySelection,
    diffSelectedResource
  );

  useResourceYamlSchema(
    String(userDataDir),
    String(k8sVersion),
    selectedResource || (resourcesFromSelectedPath.length === 1 ? resourcesFromSelectedPath[0] : undefined),
    selectedFilePath,
    fileMap
  );

  useDebouncedCodeSave(
    editor,
    orgCode,
    code,
    isDirty,
    isValid,
    activeResourceMetaMap,
    selectedResourceId,
    selectedFilePath,
    setOrgCode
  );

  useMonacoUiState(editor, selectedResourceId, selectedFilePath);

  const editorDidMount = (e: monaco.editor.IStandaloneCodeEditor) => {
    registerStaticActions(e);

    setEditor(e);

    e.updateOptions({tabSize: 2, scrollBeyondLastLine: false});
    e.revealLineNearTop(1);
    e.setSelection(new monaco.Selection(0, 0, 0, 0));
    setEditorMounted(true);
  };

  const onChange = (newValue: any) => {
    dispatch(setLastChangedLine(0));
    setDirty(orgCode !== newValue);
    setCode(newValue);

    if (!autosavingStatus) {
      dispatch(setAutosavingStatus(true));
    }

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
    if (!firstCodeLoadedOnEditor) {
      setFirstCodeLoadedOnEditor(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, selectedResourceId, activeResourceMetaMap]);

  useEffect(() => {
    let newCode = '';
    if (selectedResourceId) {
      const resourceContent = activeResourceContentMap[selectedResourceId];
      if (resourceContent) {
        newCode = resourceContent.text;
        monaco.editor?.getModels()?.forEach(model => {
          if (!model.isAttachedToEditor()) {
            model.dispose();
          }
        });
        editor?.setModel(monaco.editor.createModel(newCode, 'yaml'));
      }
    } else if (selectedFilePath && selectedFilePath !== fileMap[ROOT_FILE_ENTRY].filePath) {
      const filePath = path.join(fileMap[ROOT_FILE_ENTRY].filePath, selectedFilePath);
      const fileStats = getFileStats(filePath);
      if (fileStats && fileStats.isFile()) {
        newCode = fs.readFileSync(filePath, 'utf8');
        monaco.editor?.getModels()?.forEach(model => {
          if (!model.isAttachedToEditor()) {
            model.dispose();
          }
        });

        // monaco has no language registered for tpl extension so use yaml instead (as these could be Helm templates)
        if (filePath.toLowerCase().endsWith('.tpl')) {
          editor?.setModel(monaco.editor.createModel(newCode, 'yaml'));
        } else {
          editor?.setModel(monaco.editor.createModel(newCode, undefined, Uri.file(filePath)));
        }
      }
    }

    setCode(newCode);
    setOrgCode(newCode);
    setDirty(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilePath, selectedResourceId]);

  useEffect(() => {
    if (!selectedFilePath || !shouldEditorReloadSelection) {
      return;
    }
    log.info('[Monaco]: selected file was updated outside Monokle - reading file...');
    const filePath = path.join(fileMap[ROOT_FILE_ENTRY].filePath, selectedFilePath);
    const fileStats = getFileStats(filePath);
    if (fileStats && fileStats.isFile()) {
      const newCode = fs.readFileSync(filePath, 'utf8');
      setCode(newCode);
      setOrgCode(newCode);
      setDirty(false);
      dispatch(editorHasReloadedSelectedPath(false));
    } else {
      log.warn('[Monaco]: selected file was updated outside Monokle - unable to read file');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilePath, shouldEditorReloadSelection]);

  useEffect(() => {
    if (selectedResource && selectedResource.text !== code) {
      setCode(selectedResource.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResource]);

  useEffect(() => {
    if (editor && lastChangedLine) {
      editor.revealLineInCenter(lastChangedLine);
    } else if (editor) {
      editor.revealLineNearTop(1);
      editor.setSelection(new monaco.Selection(0, 0, 0, 0));
    }
  }, [editor, selectedResourceId, firstCodeLoadedOnEditor, lastChangedLine]);

  // read-only if we're in preview mode and another resource is selected - or if nothing is selected at all - or allowEditInClusterMode is false
  const isReadOnlyMode = useMemo(() => {
    if (isInClusterMode && !settings.allowEditInClusterMode) {
      return true;
    }
    if (
      isInPreviewMode &&
      isHelmPreview(preview) &&
      isHelmValuesFileSelection(selection) &&
      preview.valuesFileId === selection.valuesFileId
    ) {
      return true;
    }
    return !selectedFilePath && !selectedResourceId;
  }, [
    isInPreviewMode,
    isInClusterMode,
    selectedResourceId,
    selectedFilePath,
    settings.allowEditInClusterMode,
    preview,
    selection,
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
