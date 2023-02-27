/* eslint-disable import/order */
import {useCallback, useEffect, useMemo, useRef} from 'react';
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

import {isInClusterModeSelector, settingsSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  editorHasReloadedSelectedPath,
  extendResourceFilter,
  selectFile,
  selectImage,
  selectResource,
  setAutosavingStatus,
} from '@redux/reducers/main';
import {openNewResourceWizard} from '@redux/reducers/ui';
import {isInPreviewModeSelectorNew, selectedFilePathSelector, selectedHelmValuesSelector} from '@redux/selectors';
import {
  activeResourceStorageSelector,
  useActiveResourceContentMapRef,
  useActiveResourceMetaMap,
  useResourceContentMap,
  useResourceContentMapRef,
  useResourceMetaMap,
} from '@redux/selectors/resourceMapSelectors';
import {useResource, useSelectedResource} from '@redux/selectors/resourceSelectors';
import {getLocalResourcesForPath} from '@redux/services/fileEntry';

import useResourceYamlSchema from '@hooks/useResourceYamlSchema';

import {getFileStats} from '@utils/files';
import {useSelectorWithRef, useStateWithRef} from '@utils/hooks';
import {KUBESHOP_MONACO_THEME} from '@utils/monaco';
import {parseAllYamlDocuments} from '@utils/yaml';

import {getResourceKindHandler} from '@src/kindhandlers';

import {ResourceRef} from '@monokle/validation';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {ResourceFilterType} from '@shared/models/appState';
import {ResourceIdentifier} from '@shared/models/k8sResource';
import {isHelmPreview} from '@shared/models/preview';
import {ResourceSelection, isHelmValuesFileSelection} from '@shared/models/selection';
import {MonacoRange, NewResourceWizardInput} from '@shared/models/ui';

import * as S from './Monaco.styled';
import useCodeIntel from './useCodeIntel';
import useDebouncedCodeSave from './useDebouncedCodeSave';
import useEditorKeybindings from './useEditorKeybindings';
import useMonacoUiState from './useMonacoUiState';

type IProps = {
  diffSelectedResource: () => void;
  applySelection: () => void;
  height?: number;
  providedResourceSelection?: ResourceSelection;
  providedFilePath?: string;
  providedRange?: MonacoRange;
};

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

const Monaco: React.FC<IProps> = props => {
  const {diffSelectedResource, applySelection, height, providedResourceSelection, providedFilePath, providedRange} =
    props;
  const dispatch = useAppDispatch();

  const [fileMap, fileMapRef] = useSelectorWithRef(state => state.main.fileMap);

  const activeResourceMetaMap = useActiveResourceMetaMap();
  const activeResourceMetaMapRef = useRef(activeResourceMetaMap);
  activeResourceMetaMapRef.current = activeResourceMetaMap;
  const activeResourceContentMapRef = useActiveResourceContentMapRef();
  const transientResourceContentMapRef = useResourceContentMapRef('transient');

  const stateSelectedResource = useSelectedResource();
  const providedResource = useResource(providedResourceSelection?.resourceIdentifier);

  const selectedResource = providedResourceSelection ? providedResource : stateSelectedResource;
  const selectedResourceRef = useRef(selectedResource);
  selectedResourceRef.current = selectedResource;

  const [, autosavingStatusRef] = useSelectorWithRef(state => state.main.autosaving.status);
  const [, activeResourceStorageRef] = useSelectorWithRef(activeResourceStorageSelector);

  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const helmTemplatesMap = useAppSelector(state => state.main.helmTemplatesMap);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const imagesList = useAppSelector(state => state.main.imagesList);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const k8sVersion = useAppSelector(state => state.config.projectConfig?.k8sVersion);
  const preview = useAppSelector(state => state.main.preview);

  const localResourceMetaMap = useResourceMetaMap('local');
  const localResourceContentMap = useResourceContentMap('local');
  // TODO: 2.0+ as a quick fix for Monaco, we're including the selectedHelmValuesFile in this selector
  const [selectedFilePath, selectedFilePathRef] = useSelectorWithRef(state => {
    if (providedFilePath) {
      return providedFilePath;
    }

    const _selectedFilePath = selectedFilePathSelector(state);
    if (_selectedFilePath) {
      return _selectedFilePath;
    }
    const _selectedHelmValues = selectedHelmValuesSelector(state);
    return _selectedHelmValues?.filePath;
  });

  const lastChangedLine = useAppSelector(state => state.main.lastChangedLine);
  const selection = useAppSelector(state => state.main.selection);
  const settings = useAppSelector(settingsSelector);
  const shouldEditorReloadSelection = useAppSelector(state => state.main.selectionOptions.shouldEditorReload);
  const userDataDir = useAppSelector(state => state.config.userDataDir);

  const selectedResourceIdRef = useRef(selectedResource?.id);
  selectedResourceIdRef.current = selectedResource?.id;

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

  const [code, setCode, codeRef] = useStateWithRef('');
  const isDirtyRef = useRef(false);
  const isValidRef = useRef(true);
  const firstCodeLoadedOnEditorRef = useRef(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const originalCodeRef = useRef<string>('');
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const triggerSelectResource = (resourceIdentifier: ResourceIdentifier) => {
    dispatch(selectResource({resourceIdentifier}));
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
    editorRef,
    selectedResource:
      selectedResource || (resourcesFromSelectedPath.length === 1 ? resourcesFromSelectedPath[0] : undefined),
    code,
    resourceMetaMap: activeResourceMetaMap,
    fileMap,
    imagesList,
    selectResource: triggerSelectResource,
    selectFilePath,
    createResource: isInPreviewMode ? undefined : createResource,
    filterResources,
    selectImageHandler,
    selectedPath: selectedFilePath,
    helmValuesMap,
    helmChartMap,
    helmTemplatesMap,
    isDirty: isDirtyRef.current,
    activeResourceStorage: activeResourceStorageRef.current,
    selection,
  });

  const {registerStaticActions} = useEditorKeybindings(
    editorRef,
    hiddenInputRef,
    fileMapRef,
    applySelection,
    diffSelectedResource
  );

  useResourceYamlSchema(
    String(userDataDir),
    String(k8sVersion),
    selectedResource?.id || (resourcesFromSelectedPath.length === 1 ? resourcesFromSelectedPath[0]?.id : undefined),
    selectedResourceRef,
    selectedFilePath,
    fileMapRef
  );

  const debouncedSaveContent = useDebouncedCodeSave(
    originalCodeRef,
    activeResourceMetaMapRef,
    selectedResourceIdRef,
    selectedFilePathRef
  );

  useMonacoUiState(editorRef.current, selectedResourceIdRef.current, selectedFilePath);

  const editorDidMount = useCallback(
    (e: monaco.editor.IStandaloneCodeEditor) => {
      registerStaticActions(e);

      editorRef.current = e;

      e.updateOptions({tabSize: 2, scrollBeyondLastLine: false});
      e.revealLineNearTop(1);
      e.setSelection(new monaco.Selection(0, 0, 0, 0));
    },
    [registerStaticActions]
  );

  const onChange = useCallback(
    (newValue: any) => {
      if (!newValue || typeof newValue !== 'string') {
        return;
      }
      // dispatch(setLastChangedLine(0)); // TODO: why do we set this to 0? shouldn't we set it to the current line?
      isDirtyRef.current = originalCodeRef.current !== newValue;
      setCode(newValue);

      if (!autosavingStatusRef.current) {
        dispatch(setAutosavingStatus(true));
      }

      if (selectedResourceIdRef.current) {
        // this will slow things down if document gets large - need to find a better solution...
        const documents = parseAllYamlDocuments(newValue);
        // only accept single document changes for now
        isValidRef.current = documents.length === 1 && isValidResourceDocument(documents[0]);
      } else {
        isValidRef.current = true;
      }

      // try to save
      if (!isDirtyRef.current || !isValidRef.current) {
        return;
      }

      if (originalCodeRef.current !== undefined && originalCodeRef.current !== newValue) {
        debouncedSaveContent(newValue);
      }
    },
    [autosavingStatusRef, debouncedSaveContent, dispatch, setCode]
  );

  useEffect(() => {
    if (!firstCodeLoadedOnEditorRef.current) {
      firstCodeLoadedOnEditorRef.current = true;
    }
  }, [code]);

  useEffect(() => {
    editorRef.current?.getModel()?.dispose();
    let newCode = '';
    const rootFilePath = fileMapRef.current?.[ROOT_FILE_ENTRY]?.filePath;
    if (selectedResource?.id) {
      const resourceContent =
        selectedResource.storage === 'transient'
          ? transientResourceContentMapRef.current[selectedResource.id]
          : activeResourceContentMapRef.current?.[selectedResource.id];
      if (resourceContent) {
        if (codeRef.current === resourceContent.text) {
          return;
        }
        newCode = resourceContent.text;
        monaco.editor?.getModels()?.forEach(model => {
          if (!model.isAttachedToEditor()) {
            model.dispose();
          }
        });
        editorRef.current?.setModel(monaco.editor.createModel(newCode, 'yaml'));
      }
    } else if (rootFilePath && selectedFilePath && selectedFilePath !== rootFilePath) {
      const filePath = path.join(rootFilePath, selectedFilePath);
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
          editorRef.current?.setModel(monaco.editor.createModel(newCode, 'yaml'));
        } else {
          editorRef.current?.setModel(monaco.editor.createModel(newCode, undefined, Uri.file(filePath)));
        }
      }
    }

    setCode(newCode);
    originalCodeRef.current = newCode;
    isDirtyRef.current = false;
  }, [
    selectedFilePath,
    selectedResource?.id,
    selectedResource?.storage,
    codeRef,
    activeResourceContentMapRef,
    transientResourceContentMapRef,
    fileMapRef,
    setCode,
  ]);

  useEffect(() => {
    if (!selectedFilePathRef.current || !shouldEditorReloadSelection) {
      return;
    }
    log.info('[Monaco]: selected file was updated outside Monokle - reading file...');
    const notFoundWarning = '[Monaco]: selected file was updated outside Monokle - unable to read file';
    const rootFilePath = fileMapRef.current?.[ROOT_FILE_ENTRY].filePath;
    if (!rootFilePath) {
      log.warn(notFoundWarning);
      return;
    }
    const filePath = path.join(rootFilePath, selectedFilePathRef.current);
    const fileStats = getFileStats(filePath);
    if (fileStats && fileStats.isFile()) {
      const newCode = fs.readFileSync(filePath, 'utf8');
      setCode(newCode);
      originalCodeRef.current = newCode;
      isDirtyRef.current = false;
      dispatch(editorHasReloadedSelectedPath(false));
    } else {
      log.warn(notFoundWarning);
    }
  }, [shouldEditorReloadSelection, selectedFilePathRef, fileMapRef, setCode, dispatch]);

  useEffect(() => {
    if (editorRef.current && lastChangedLine) {
      editorRef.current.revealLineInCenter(lastChangedLine);
    } else if (editorRef.current) {
      editorRef.current.revealLineNearTop(1);
      editorRef.current.setSelection(new monaco.Selection(0, 0, 0, 0));
    }
  }, [lastChangedLine]);

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
    return !selectedFilePath && !selectedResource;
  }, [
    isInPreviewMode,
    isInClusterMode,
    selectedResource,
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

  useEffect(() => {
    if (!providedRange || !editorRef.current) return;

    editorRef.current.setSelection(providedRange);
    editorRef.current.revealLineInCenter(providedRange.startLineNumber);
  }, [providedRange]);

  return (
    <S.MonacoContainer ref={containerRef} $height={height}>
      <S.HiddenInputContainer>
        <S.HiddenInput ref={hiddenInputRef} type="text" />
      </S.HiddenInputContainer>

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
    </S.MonacoContainer>
  );
};
export default Monaco;
