import {createSelector} from 'reselect';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AppState} from '@shared/models/appState';
import {HelmPreviewConfiguration} from '@shared/models/config';
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
  (state: RootState) => state,
  state => {
    const selection = state.main.selection;
    if (!isFileSelection(selection)) {
      return undefined;
    }
    return selection.filePath;
  }
);

export const selectedHelmConfigSelector = createSelector(
  (state: RootState) => state,
  state => {
    const selection = state.main.selection;
    if (!isPreviewConfigurationSelection(selection)) {
      return undefined;
    }
    return state.config.projectConfig?.helm?.previewConfigurationMap?.[selection.previewConfigurationId];
  }
);

export const previewedValuesFileSelector = createSelector(
  (state: RootState) => state,
  state => {
    const preview = state.main.preview;
    if (!preview || preview.type !== 'helm') {
      return undefined;
    }
    return state.main.helmValuesMap[preview.valuesFileId];
  }
);

export const selectedHelmValuesSelector = createSelector(
  (state: RootState) => state,
  state => {
    const selection = state.main.selection;
    if (!selection || selection.type !== 'helm.values.file') {
      return undefined;
    }
    return state.main.helmValuesMap[selection.valuesFileId];
  }
);

export const previewedHelmChartSelector = createSelector(
  (state: RootState) => state,
  state => {
    const preview = state.main.preview;
    if (!preview || preview.type !== 'helm') {
      return undefined;
    }
    return state.main.helmChartMap[preview.chartId];
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
  [(state: RootState) => state.main.selection, (state: RootState) => state.main.imagesList],
  (selection, imagesList) => {
    if (!selection || selection.type !== 'image') {
      return undefined;
    }
    return imagesList.find(image => image.id === selection.imageId);
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

export const selectHelmConfig = (state: RootState, id?: string): HelmPreviewConfiguration | undefined => {
  if (!id) return undefined;
  return state.config.projectConfig?.helm?.previewConfigurationMap?.[id] ?? undefined;
};

export const selectCurrentKubeConfig = createSelector(
  [(state: RootState) => state.config.projectConfig?.kubeConfig, (state: RootState) => state.config.kubeConfig],
  (projectKubeConfig, kubeConfig) => projectKubeConfig || kubeConfig
);

export const isInClusterModeSelector = createSelector(
  [selectCurrentKubeConfig, state => state.main.clusterConnection?.context],
  (kubeConfig, clusterConnectionContext) => {
    return kubeConfig && isDefined(clusterConnectionContext) && clusterConnectionContext === kubeConfig.currentContext;
  }
);

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
