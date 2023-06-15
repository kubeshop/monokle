import {useCallback, useEffect, useRef} from 'react';
import {monaco} from 'react-monaco-editor';

import {debounce} from 'lodash';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setMonacoEditor} from '@redux/reducers/ui';

import {codeIntels} from '@molecules/Monaco/CodeIntel/index';
import {ShouldApplyCodeIntelParams} from '@molecules/Monaco/CodeIntel/types';

import {ResourceRef} from '@monokle/validation';
import {
  FileMapType,
  HelmChartMapType,
  HelmTemplatesMapType,
  HelmValuesMapType,
  ImageMapType,
  ResourceFilterType,
} from '@shared/models/appState';
import {K8sResource, ResourceIdentifier, ResourceMetaMap, ResourceStorage} from '@shared/models/k8sResource';
import {AppSelection} from '@shared/models/selection';

import {EDITOR_DISPOSABLES} from './disposables';
import {clearDecorations, setDecorations, setMarkers} from './editorHelpers';

interface CodeIntelProps {
  editorRef: React.RefObject<monaco.editor.IStandaloneCodeEditor | null>;
  isDirty: boolean;
  selectedResource: K8sResource | undefined;
  code: string | undefined;
  resourceMetaMap: ResourceMetaMap;
  fileMap: FileMapType;
  imageMap: ImageMapType;
  selectResource: (resourceIdentifier: ResourceIdentifier) => void;
  selectFilePath: (filePath: string) => void;
  createResource: ((outgoingRef: ResourceRef, namespace?: string, targetFolder?: string) => void) | undefined;
  filterResources: (filter: ResourceFilterType) => void;
  selectImageHandler: (imageId: string) => void;
  selectedPath?: string;
  helmChartMap?: HelmChartMapType;
  helmValuesMap?: HelmValuesMapType;
  helmTemplatesMap?: HelmTemplatesMapType;
  activeResourceStorage: ResourceStorage;
  selection?: AppSelection;
}

function useCodeIntel(props: CodeIntelProps) {
  const {
    editorRef,
    selectedResource,
    code,
    imageMap,
    resourceMetaMap,
    fileMap,
    selectResource,
    selectFilePath,
    createResource,
    filterResources,
    selectImageHandler,
    selectedPath,
    helmChartMap,
    helmValuesMap,
    helmTemplatesMap,
    activeResourceStorage,
    selection,
  } = props;

  const idsOfDecorationsRef = useRef<string[]>([]);
  const disposablesRef = useRef<monaco.IDisposable[]>([]);
  const currentFile = Object.values(fileMap).find(file => selectedPath === file.filePath);
  const dispatch = useAppDispatch();
  const lastChangedLine = useAppSelector(state => state.main.lastChangedLine);

  const clearCodeIntel = useCallback(() => {
    if (editorRef.current) {
      clearDecorations(editorRef.current, idsOfDecorationsRef.current);
      idsOfDecorationsRef.current = [];
    }
    disposablesRef.current.forEach(disposable => disposable.dispose());
    disposablesRef.current = [];
  }, [editorRef]);

  const applyCodeIntel = useCallback(() => {
    if (!editorRef.current) {
      return;
    }

    const shouldApplyParams: ShouldApplyCodeIntelParams = {
      helmValuesMap,
      currentFile,
      selectedResourceMeta: selectedResource,
    };

    const codeIntelForFile = codeIntels.find(ci => ci.shouldApply(shouldApplyParams));

    if (codeIntelForFile) {
      codeIntelForFile
        .codeIntel({
          fileMap,
          currentFile,
          helmChartMap,
          helmValuesMap,
          helmTemplatesMap,
          selectFilePath,
          code,
          lastChangedLine,
          setEditorSelection: ({selection: monacoSelection}) => {
            dispatch(
              setMonacoEditor({
                selection: monacoSelection,
              })
            );
          },
          resource: selectedResource,
          selectResource,
          createResource,
          filterResources,
          selectImageHandler,
          resourceMetaMap,
          model: editorRef.current.getModel(),
          activeResourceStorage,
        })
        .then(data => {
          if (!data) {
            return;
          }
          const {newDecorations, newDisposables, newMarkers} = data;

          if (newDecorations && editorRef.current) {
            idsOfDecorationsRef.current = setDecorations(editorRef.current, newDecorations);
          }
          if (newDisposables) {
            disposablesRef.current = newDisposables;
            EDITOR_DISPOSABLES.push(...newDisposables);
          }

          if (editorRef.current) {
            const model = editorRef.current.getModel();
            if (model && newMarkers) {
              setMarkers(model, newMarkers);
            }
          }
        });
    }
  }, [
    activeResourceStorage,
    code,
    currentFile,
    dispatch,
    editorRef,
    fileMap,
    filterResources,
    helmChartMap,
    helmTemplatesMap,
    lastChangedLine,
    resourceMetaMap,
    selectFilePath,
    selectImageHandler,
    selectResource,
    selectedResource,
    createResource,
    helmValuesMap,
  ]);

  const applyCodeIntelRef = useRef(applyCodeIntel);
  applyCodeIntelRef.current = applyCodeIntel;

  const debouncedUpdate = useRef(
    debounce(() => {
      applyCodeIntelRef.current();
    }, 500)
  );

  useEffect(() => {
    clearCodeIntel();
  }, [selection, clearCodeIntel]);

  useEffect(() => {
    debouncedUpdate.current();

    return () => {
      debouncedUpdate.current.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, selectedResource, resourceMetaMap, editorRef, imageMap, helmTemplatesMap, helmValuesMap]);

  // useEffect(() => {
  //   if (completionDisposableRef.current && completionDisposableRef.current.dispose) {
  //     completionDisposableRef.current.dispose();
  //   }
  //   if (editor) {
  //     completionDisposableRef.current = applyAutocomplete(resourceMap);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [selectedResource, resourceMap, editor]);
}

export default useCodeIntel;
