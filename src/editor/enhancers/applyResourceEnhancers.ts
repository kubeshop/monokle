import monaco from 'monaco-editor';

import {AppDispatch} from '@shared/models/appDispatch';
import {ResourceIdentifier} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';

import {applyEditorRefs} from './k8sResource/refs';
import {resourceSymbolsEnhancer} from './k8sResource/symbols';
import {applyEditorValidation} from './k8sResource/validation';

export const editorEnhancers = [applyEditorValidation, applyEditorRefs, resourceSymbolsEnhancer];

export async function applyResourceEnhancers(payload: {
  state: RootState;
  dispatch: AppDispatch;
  editor: monaco.editor.ICodeEditor;
  resourceIdentifier: ResourceIdentifier;
}) {
  const {state, dispatch, editor, resourceIdentifier} = payload;
  const promises = editorEnhancers.map(enhancer =>
    Promise.resolve(enhancer({state, editor, resourceIdentifier, dispatch}))
  );
  await Promise.all(promises);
}
