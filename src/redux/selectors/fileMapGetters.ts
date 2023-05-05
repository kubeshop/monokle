import {FileMapType} from '@shared/models/appState';

export const getIncludedFilePaths = (fileMap: FileMapType) => {
  return Object.values(fileMap)
    .filter(file => !file.isExcluded)
    .map(file => file.filePath);
};
