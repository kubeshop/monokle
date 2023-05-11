import * as monaco from 'monaco-editor';

import {AppDispatch} from '@shared/models/appDispatch';
import {ResourceIdentifier} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';

type EditorEnhancer = (props: {
  state: RootState;
  dispatch: AppDispatch;
  editor: monaco.editor.ICodeEditor;
  resourceIdentifier?: ResourceIdentifier;
}) => Promise<void> | void;

export const createEditorEnhancer = (enhancer: EditorEnhancer) => enhancer;
