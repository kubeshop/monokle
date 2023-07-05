import {FileMapType} from '@shared/models/appState';

export const getIncludedFilePaths = (fileMap: FileMapType) => {
  return Object.values(fileMap)
    .filter(file => !file.isExcluded && file.containsK8sResources)
    .map(file => file.filePath);
};
