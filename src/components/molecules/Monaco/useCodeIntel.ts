import {useEffect, useRef} from 'react';
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
  ImagesListType,
  ResourceFilterType,
} from '@shared/models/appState';
import {K8sResource, ResourceIdentifier, ResourceMetaMap, ResourceStorage} from '@shared/models/k8sResource';

import {clearDecorations, setDecorations, setMarkers} from './editorHelpers';

interface CodeIntelProps {
  editor: monaco.editor.IStandaloneCodeEditor | null;
  isDirty: boolean;
  selectedResource: K8sResource | undefined;
  code: string | undefined;
  resourceMetaMap: ResourceMetaMap;
  fileMap: FileMapType;
  imagesList: ImagesListType;
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
}

function useCodeIntel(props: CodeIntelProps) {
  const {
    editor,
    selectedResource,
    code,
    imagesList,
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
    isDirty,
    activeResourceStorage,
  } = props;

  const idsOfDecorationsRef = useRef<string[]>([]);
  const disposablesRef = useRef<monaco.IDisposable[]>([]);
  const completionDisposableRef = useRef<monaco.IDisposable | null>(null);
  const currentFile = Object.values(fileMap).find(file => selectedPath === file.filePath);
  const dispatch = useAppDispatch();
  const lastChangedLine = useAppSelector(state => state.main.lastChangedLine);

  const clearCodeIntel = () => {
    if (editor) {
      clearDecorations(editor, idsOfDecorationsRef.current);
      idsOfDecorationsRef.current = [];
    }
    disposablesRef.current.forEach(disposable => disposable.dispose());
    disposablesRef.current = [];
  };

  const applyCodeIntel = () => {
    if (!editor) {
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
          setEditorSelection: ({selection}) => {
            dispatch(
              setMonacoEditor({
                selection,
              })
            );
          },
          resource: selectedResource,
          selectResource,
          createResource,
          filterResources,
          selectImageHandler,
          resourceMetaMap,
          model: editor.getModel(),
          activeResourceStorage,
        })
        .then(data => {
          if (!data) {
            return;
          }
          const {newDecorations, newDisposables, newMarkers} = data;

          if (newDecorations) {
            idsOfDecorationsRef.current = setDecorations(editor, newDecorations);
          }
          if (newDisposables) {
            disposablesRef.current = newDisposables;
          }

          const model = editor.getModel();
          if (model && newMarkers) {
            setMarkers(model, newMarkers);
          }
        });
    }
  };

  const debouncedUpdate = debounce(() => {
    clearCodeIntel();
    applyCodeIntel();
  }, 100);

  useEffect(() => {
    debouncedUpdate();

    return () => {
      debouncedUpdate.cancel();
      clearCodeIntel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, selectedResource, resourceMetaMap, editor, imagesList, helmTemplatesMap, helmValuesMap]);

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
