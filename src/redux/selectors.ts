import {isBoolean} from 'lodash';
import {createSelector} from 'reselect';

import {getResourceKindHandler} from '@src/kindhandlers';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AppState} from '@shared/models/appState';
import {AppConfig, HelmPreviewConfiguration, ProjectConfig} from '@shared/models/config';
import {FileEntry} from '@shared/models/fileEntry';
import {HelmValuesFile} from '@shared/models/helm';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';
import {RootState} from '@shared/models/rootState';
import {isFileSelection, isPreviewConfigurationSelection} from '@shared/models/selection';
import {Colors} from '@shared/styles/colors';
import {isDefined} from '@shared/utils/filter';

import {mergeConfigs, populateProjectConfig} from './services/projectConfig';

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
  (state: RootState) => state,
  state => {
    const preview = state.main.preview;
    if (!preview || preview.type !== 'helm-config') {
      return undefined;
    }
    return state.config.projectConfig?.helm?.previewConfigurationMap?.[preview.configId] ?? undefined;
  }
);

export const selectedImageSelector = createSelector(
  (state: RootState) => state,
  state => {
    const selection = state.main.selection;
    if (!selection || selection.type !== 'image') {
      return undefined;
    }
    return state.main.imagesList.find(image => image.id === selection.imageId);
  }
);

export const selectedImageIdSelector = createSelector(
  (state: RootState) => state,
  state => {
    const selection = state.main.selection;
    if (!selection || selection.type !== 'image') {
      return undefined;
    }
    return selection.imageId;
  }
);

export const rootFileEntrySelector = createSelector(
  (state: RootState) => state.main.fileMap,
  fileMap => {
    const rootFileEntry: FileEntry | undefined = fileMap[ROOT_FILE_ENTRY];
    return rootFileEntry;
  }
);

export const rootFilePathSelector = createSelector(
  (state: RootState) => state.main.fileMap,
  fileMap => {
    const rootFileEntry: FileEntry | undefined = fileMap[ROOT_FILE_ENTRY];
    return rootFileEntry?.filePath;
  }
);

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

export const isInClusterModeSelector = createSelector(
  (state: RootState) => state,
  state => {
    const kubeConfig = selectCurrentKubeConfig(state);
    const clusterConnectionContext = state.main.clusterConnection?.context;
    return kubeConfig && isDefined(clusterConnectionContext) && clusterConnectionContext === kubeConfig.currentContext;
  }
);

// TODO: rename this after finishing refactoring all places where the old `isInPreviewModeSelector` is used
// the previous selector returned `true` even if you were in ClusterMode but that's no longer desired
export const isInPreviewModeSelectorNew = createSelector(
  (state: RootState) => state,
  state => {
    return Boolean(state.main.preview);
  }
);

export const currentConfigSelector = createSelector(
  (state: RootState) => state.config,
  config => {
    const applicationConfig: ProjectConfig = populateProjectConfig(config);
    const projectConfig: ProjectConfig | null | undefined = config.projectConfig;
    return mergeConfigs(applicationConfig, projectConfig);
  }
);

export const settingsSelector = createSelector(
  (state: RootState) => state,
  state => {
    const currentConfig: ProjectConfig = currentConfigSelector(state);
    return currentConfig.settings || {};
  }
);

export const scanExcludesSelector = createSelector(
  (state: RootState) => state,
  state => {
    const currentKubeConfig: ProjectConfig = currentConfigSelector(state);
    return currentKubeConfig.scanExcludes || [];
  }
);

export const fileIncludesSelector = createSelector(
  (state: RootState) => state,
  state => {
    const currentKubeConfig: ProjectConfig = currentConfigSelector(state);
    return currentKubeConfig.fileIncludes || [];
  }
);

export const kubeConfigContextColorSelector = createSelector(
  (state: RootState) => state.config,
  config => {
    if (!config.kubeConfig.currentContext) {
      return Colors.volcano8;
    }

    return config.kubeConfigContextsColors[config.kubeConfig.currentContext] || Colors.volcano8;
  }
);

export const currentKubeContext = (configState: AppConfig) => {
  if (configState.kubeConfig.currentContext) {
    return configState.kubeConfig.currentContext;
  }

  return '';
};

export const kubeConfigContextsSelector = createSelector(
  (state: RootState) => state.config,
  config => {
    if (config.kubeConfig.contexts) {
      return config.kubeConfig.contexts;
    }
    return [];
  }
);

export const currentClusterAccessSelector = createSelector(
  (state: RootState) => state.config,
  config => {
    let currentContext = currentKubeContext(config);
    if (!currentContext) {
      return [];
    }

    if (!config?.kubeConfig?.currentContext) {
      return [];
    }

    return config.clusterAccess?.filter(ca => ca.context === currentContext) || [];
  }
);

export const kubeConfigPathSelector = createSelector(
  (state: RootState) => state.config,
  config => {
    if (config.kubeConfig.path) {
      return config.kubeConfig.path;
    }
    return '';
  }
);

export const kubeConfigPathValidSelector = createSelector(
  (state: RootState) => state.config,
  config => {
    if (isBoolean(config.kubeConfig.isPathValid)) {
      return Boolean(config.kubeConfig.isPathValid);
    }
    return false;
  }
);

export const selectCurrentKubeConfig = (state: RootState) => {
  return state.config.kubeConfig;
};

export const registeredKindHandlersSelector = createSelector(
  (state: RootState) => state.main.registeredKindHandlers,
  registeredKindHandlers => {
    return registeredKindHandlers
      .map(kind => getResourceKindHandler(kind))
      .filter((handler): handler is ResourceKindHandler => handler !== undefined);
  }
);

export const knownResourceKindsSelector = createSelector(
  (state: RootState) => state.main.registeredKindHandlers,
  registeredKindHandlers => {
    return registeredKindHandlers
      .map(kind => getResourceKindHandler(kind))
      .filter((handler): handler is ResourceKindHandler => handler !== undefined)
      .map(handler => handler.kind);
  }
);
