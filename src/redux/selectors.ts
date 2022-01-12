import _ from 'lodash';
import {createSelector} from 'reselect';

import {CLUSTER_DIFF_PREFIX, PREVIEW_PREFIX, ROOT_FILE_ENTRY} from '@constants/constants';

import {ProjectConfig} from '@models/appconfig';
import {K8sResource} from '@models/k8sresource';

import {isKustomizationResource} from '@redux/services/kustomize';

import {RootState} from './store';

export const rootFolderSelector = createSelector(
  (state: RootState) => state.main.fileMap,
  fileMap => fileMap[ROOT_FILE_ENTRY]?.filePath
);

export const allResourcesSelector = createSelector(
  (state: RootState) => state.main.resourceMap,
  resourceMap => Object.values(resourceMap)
);

export const activeResourcesSelector = createSelector(
  allResourcesSelector,
  (state: RootState) => state.main.previewResourceId,
  (state: RootState) => state.main.previewValuesFileId,
  (resources, previewResource, previewValuesFile) =>
    resources.filter(
      r =>
        ((previewResource === undefined && previewValuesFile === undefined) || r.filePath.startsWith(PREVIEW_PREFIX)) &&
        !r.filePath.startsWith(CLUSTER_DIFF_PREFIX)
    )
);

export const selectedResourceSelector = createSelector(
  (state: RootState) => state.main.resourceMap,
  (state: RootState) => state.main.selectedResourceId,
  (resourceMap, selectedResourceId) => (selectedResourceId ? resourceMap[selectedResourceId] : undefined)
);

export const kustomizationsSelector = createSelector(allResourcesSelector, resources =>
  resources.filter((r: K8sResource) => isKustomizationResource(r))
);

export const helmChartsSelector = createSelector(
  (state: RootState) => state.main.helmChartMap,
  helmCharts => helmCharts
);

export const helmValuesSelector = createSelector(
  (state: RootState) => state.main.helmValuesMap,
  helmValuesMap => helmValuesMap
);

export const isInPreviewModeSelector = createSelector(
  (state: RootState) => state.main,
  appState => Boolean(appState.previewResourceId) || Boolean(appState.previewValuesFileId)
);

export const isInClusterModeSelector = createSelector(
  (state: RootState) => state,
  appState =>
    Boolean(appState.main.previewResourceId && appState.main.previewResourceId.endsWith(appState.config.kubeconfigPath))
);

export const logsSelector = createSelector(
  (state: RootState) => state.logs.logs,
  logs => logs.join('\n')
);

export const activeProjectSelector = createSelector(
  (state: RootState) => state.config,
  config => config.projects.find(p => p.rootFolder === config.selectedProjectRootFolder)
);

export const currentConfigSelector = createSelector(
  (state: RootState) => state.config,
  config => {
    const applicationConfig: ProjectConfig = {
      scanExcludes: config.scanExcludes,
      fileIncludes: config.fileIncludes,
      folderReadsMaxDepth: config.folderReadsMaxDepth,
    };
    applicationConfig.settings = {
      ...config.settings,
    };
    const projectConfig: ProjectConfig | null | undefined = config.projectConfig;

    return mergeConfigs(applicationConfig, projectConfig);
  }
);

export const mergeConfigs = (baseConfig: ProjectConfig, config?: ProjectConfig | null) => {
  if (!(baseConfig && baseConfig.settings)) {
    throw Error('Base config must be set');
  }

  if (!config) {
    return baseConfig;
  }

  if (
    _.isString(config.settings?.helmPreviewMode) &&
    !_.isEqual(config.settings?.helmPreviewMode, baseConfig.settings?.helmPreviewMode)
  ) {
    baseConfig.settings.helmPreviewMode = config.settings?.helmPreviewMode;
  }

  if (
    _.isString(config.settings?.kustomizeCommand) &&
    !_.isEqual(config.settings?.kustomizeCommand, baseConfig.settings?.kustomizeCommand)
  ) {
    baseConfig.settings.kustomizeCommand = config.settings?.kustomizeCommand;
  }
  if (
    _.isBoolean(config.settings?.loadLastProjectOnStartup) &&
    !_.isEqual(config.settings?.loadLastProjectOnStartup, baseConfig.settings?.loadLastProjectOnStartup)
  ) {
    baseConfig.settings.loadLastProjectOnStartup = config.settings?.loadLastProjectOnStartup;
  }
  if (
    _.isBoolean(config.settings?.hideExcludedFilesInFileExplorer) &&
    !_.isEqual(config.settings?.hideExcludedFilesInFileExplorer, baseConfig.settings?.hideExcludedFilesInFileExplorer)
  ) {
    baseConfig.settings.hideExcludedFilesInFileExplorer = config.settings?.hideExcludedFilesInFileExplorer;
  }
  if (
    _.isBoolean(config.settings?.isClusterSelectorVisible) &&
    !_.isEqual(config.settings?.isClusterSelectorVisible, baseConfig.settings?.isClusterSelectorVisible)
  ) {
    baseConfig.settings.isClusterSelectorVisible = config.settings?.isClusterSelectorVisible;
  }

  if (_.isEmpty(baseConfig.settings)) {
    baseConfig.settings = undefined;
  }

  if (_.isArray(config.scanExcludes) && !_.isEqual(_.sortBy(config.scanExcludes), _.sortBy(baseConfig.scanExcludes))) {
    baseConfig.scanExcludes = config.scanExcludes;
  }

  if (_.isArray(config.fileIncludes) && !_.isEqual(_.sortBy(config.fileIncludes), _.sortBy(baseConfig.fileIncludes))) {
    baseConfig.fileIncludes = config.fileIncludes;
  }

  if (
    _.isNumber(config.folderReadsMaxDepth) &&
    !_.isEqual(config.folderReadsMaxDepth, baseConfig.folderReadsMaxDepth)
  ) {
    baseConfig.folderReadsMaxDepth = config.folderReadsMaxDepth;
  }

  return baseConfig;
};
