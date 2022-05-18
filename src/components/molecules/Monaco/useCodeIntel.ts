import {useEffect, useRef} from 'react';
import {monaco} from 'react-monaco-editor';

import {debounce} from 'lodash';

import {FileMapType, HelmChartMapType, HelmValuesMapType, ResourceFilterType, ResourceMapType} from '@models/appstate';
import {K8sResource, ResourceRef} from '@models/k8sresource';

import {useAppDispatch} from '@redux/hooks';
import {setMonacoEditor} from '@redux/reducers/ui';

import {codeIntels} from '@molecules/Monaco/CodeIntel/index';
import {ShouldApplyCodeIntelParams} from '@molecules/Monaco/CodeIntel/types';
import {applyAutocomplete} from '@molecules/Monaco/CodeIntel/util';

import {clearDecorations, setDecorations, setMarkers} from './editorHelpers';

interface CodeIntelProps {
  editor: monaco.editor.IStandaloneCodeEditor | null;
  selectedResource: K8sResource | undefined;
  code: string | undefined;
  resourceMap: ResourceMapType;
  fileMap: FileMapType;
  isEditorMounted: boolean;
  selectResource: (resourceId: string) => void;
  selectFilePath: (filePath: string) => void;
  createResource: ((outgoingRef: ResourceRef, namespace?: string, targetFolder?: string) => void) | undefined;
  filterResources: (filter: ResourceFilterType) => void;
  selectImage: (imageId: string) => void;
  selectedPath?: string;
  helmChartMap?: HelmChartMapType;
  helmValuesMap?: HelmValuesMapType;
}

function useCodeIntel(props: CodeIntelProps) {
  const {
    editor,
    selectedResource,
    code,
    resourceMap,
    fileMap,
    isEditorMounted,
    selectResource,
    selectFilePath,
    createResource,
    filterResources,
    selectImage,
    selectedPath,
    helmChartMap,
    helmValuesMap,
  } = props;

  const idsOfDecorationsRef = useRef<string[]>([]);
  const disposablesRef = useRef<monaco.IDisposable[]>([]);
  const completionDisposableRef = useRef<monaco.IDisposable | null>(null);
  const currentFile = Object.values(fileMap).find(file => selectedPath === file.filePath);
  const dispatch = useAppDispatch();

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
      selectedResource,
    };
    const codeIntelForFile = codeIntels.find(ci => ci.shouldApply(shouldApplyParams));
    if (codeIntelForFile) {
      codeIntelForFile
        .codeIntel({
          fileMap,
          currentFile,
          helmChartMap,
          helmValuesMap,
          selectFilePath,
          code,
          setEditorSelection: ({selection}) => {
            dispatch(
              setMonacoEditor({
                selection,
              })
            );
          },
          resource: selectedResource as K8sResource,
          selectResource,
          createResource,
          filterResources,
          selectImage,
          resourceMap,
          model: editor.getModel(),
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
  }, [code, isEditorMounted, selectedResource, resourceMap, editor]);

  useEffect(() => {
    if (completionDisposableRef.current && completionDisposableRef.current.dispose) {
      completionDisposableRef.current.dispose();
    }
    if (editor) {
      completionDisposableRef.current = applyAutocomplete(resourceMap);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResource, resourceMap, editor]);
}

export default useCodeIntel;
