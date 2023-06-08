import {RootState} from '@shared/models/rootState';
import {isHelmValuesFileSelection} from '@shared/models/selection';

export const getSelectedHelmValuesFilePath = (state: RootState) => {
  const selection = state.main.selection;
  if (!isHelmValuesFileSelection(selection)) {
    return undefined;
  }
  const helmValuesFile = state.main.helmValuesMap[selection.valuesFileId];
  if (!helmValuesFile) {
    return undefined;
  }
  return helmValuesFile.filePath;
};
