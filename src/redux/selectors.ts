import path from 'path';
import {createSelector} from 'reselect';

import {createFileNodes, createFolderTree, sortNodes} from '@utils/fileExplorer';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AppState} from '@shared/models/appState';
import {FileEntry} from '@shared/models/fileEntry';
import {HelmValuesFile} from '@shared/models/helm';
import {RootState} from '@shared/models/rootState';
import {isFileSelection, isPreviewConfigurationSelection} from '@shared/models/selection';
import {isDefined} from '@shared/utils/filter';

import {getResourceMetaMapFromState} from './selectors/resourceMapGetters';
import {isKustomizationResource} from './services/kustomize';

export const rootFolderSelector = createSelector(
  (state: RootState) => state.main.fileMap,
  fileMap => fileMap[ROOT_FILE_ENTRY]?.filePath
);

export const selectedFilePathSelector = createSelector(
  (state: RootState) => state.main.selection,
  selection => {
    if (!isFileSelection(selection)) {
      return undefined;
    }
    return selection.filePath;
  }
);

export const selectedHelmConfigSelector = createSelector(
  [
    (state: RootState) => state.main.selection,
    (state: RootState) => state.config.projectConfig?.helm?.previewConfigurationMap,
  ],
  (selection, previewConfigurationMap) => {
    if (!isPreviewConfigurationSelection(selection)) {
      return undefined;
    }

    return previewConfigurationMap?.[selection.previewConfigurationId];
  }
);

export const previewedValuesFileSelector = createSelector(
  [(state: RootState) => state.main.preview, (state: RootState) => state.main.helmValuesMap],

  (preview, helmValuesMap) => {
    if (preview?.type !== 'helm') {
      return undefined;
    }

    return helmValuesMap[preview.valuesFileId];
  }
);

export const selectedHelmValuesSelector = createSelector(
  [(state: RootState) => state.main.selection, (state: RootState) => state.main.helmValuesMap],
  (selection, helmValuesMap) => {
    if (selection?.type !== 'helm.values.file') {
      return undefined;
    }

    return helmValuesMap[selection.valuesFileId];
  }
);

export const previewedHelmChartSelector = createSelector(
  [(state: RootState) => state.main.preview, (state: RootState) => state.main.helmChartMap],
  (preview, helmChartMap) => {
    if (preview?.type !== 'helm') {
      return undefined;
    }

    return helmChartMap[preview.chartId];
  }
);

export const previewedHelmConfigSelector = createSelector(
  [
    (state: RootState) => state.main.preview,
    (state: RootState) => state.config.projectConfig?.helm?.previewConfigurationMap,
  ],
  (preview, previewConfigurationMap) => {
    if (!preview || preview.type !== 'helm-config') {
      return undefined;
    }
    return previewConfigurationMap?.[preview.configId] ?? undefined;
  }
);

export const selectedImageSelector = createSelector(
  [(state: RootState) => state.main.selection, (state: RootState) => state.main.imageMap],
  (selection, imageMap) => {
    if (!selection || selection.type !== 'image') {
      return undefined;
    }
    return imageMap[selection.imageId];
  }
);

export const selectedImageIdSelector = createSelector(
  (state: RootState) => state.main.selection,
  selection => {
    if (!selection || selection.type !== 'image') {
      return undefined;
    }
    return selection.imageId;
  }
);

export const rootFileEntrySelector = createSelector(
  (state: RootState) => state.main.fileMap[ROOT_FILE_ENTRY],
  (rootFileEntry: FileEntry | undefined) => {
    return rootFileEntry;
  }
);

export const rootFilePathSelector = createSelector(rootFileEntrySelector, rootFileEntry => {
  return rootFileEntry?.filePath;
});

export const helmChartsSelector = createSelector(
  (state: RootState) => state.main.helmChartMap,
  helmCharts => helmCharts
);

export const helmValuesSelector = createSelector(
  (state: RootState) => state.main.helmValuesMap,
  helmValuesMap => helmValuesMap
);

export const selectHelmValues = (state: AppState, id?: string): HelmValuesFile | undefined => {
  if (!id) return undefined;
  return state.helmValuesMap[id];
};

// TODO: rename this after finishing refactoring all places where the old `isInPreviewModeSelector` is used
// the previous selector returned `true` even if you were in ClusterMode but that's no longer desired
export const isInPreviewModeSelectorNew = createSelector(
  (state: RootState) => state.main.preview,
  preview => {
    return Boolean(preview);
  }
);

export const kustomizationResourcesSelectors = createSelector(
  (state: RootState) => getResourceMetaMapFromState(state, 'local'),
  localResourceMetaMap => {
    return Object.values(localResourceMetaMap)
      .filter(i => isKustomizationResource(i))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
);

export const projectFileTreeSelector = createSelector(
  [(state: RootState) => state.main.fileMap, (state: RootState) => state.config.fileExplorerSortOrder],
  (fileMap, fileExplorerSortOrder) => {
    const rootEntry = fileMap[ROOT_FILE_ENTRY];

    const rootFileNodes = createFileNodes(path.sep, fileMap);
    const rootFolderNodes =
      rootEntry?.children
        ?.map(folderPath => createFolderTree(`${path.sep}${folderPath}`, fileMap, fileExplorerSortOrder))
        .filter(isDefined) || [];
    return sortNodes(rootFolderNodes, rootFileNodes, fileExplorerSortOrder);
  }
);
