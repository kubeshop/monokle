import * as monaco from 'monaco-editor';

import {selectFile, selectHelmValuesFile} from '@redux/reducers/main';

import {setEditorNextSelection} from '@editor/editor.instance';
import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';

export const goToFileAndHighlightCode = (args: {
  state: RootState;
  range: monaco.IRange;
  filePath: string;
  dispatch: AppDispatch;
  isHelmValuesFile?: boolean;
}) => {
  const {state, isHelmValuesFile, range, filePath, dispatch} = args;
  if (isHelmValuesFile) {
    const valuesFileId = Object.values(state.main.helmValuesMap).find(v => v.filePath === filePath)?.id;
    if (!valuesFileId) {
      return;
    }
    dispatch(selectHelmValuesFile({valuesFileId}));
  } else {
    dispatch(selectFile({filePath}));
  }
  setEditorNextSelection(range);
};
