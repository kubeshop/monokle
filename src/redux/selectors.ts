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
      settings: {
        ...config.settings,
      },
      scanExcludes: config.scanExcludes,
      fileIncludes: config.fileIncludes,
      folderReadsMaxDepth: config.folderReadsMaxDepth,
    };
    const projectConfig: ProjectConfig | null | undefined = config.projectConfig;

    if (!projectConfig) {
      return applicationConfig;
    }

    const validConfig: ProjectConfig = {};

    if (!projectConfig.settings) {
      validConfig.settings = applicationConfig.settings;
    } else {
      validConfig.settings = {
        helmPreviewMode: projectConfig.settings.helmPreviewMode && applicationConfig.settings?.helmPreviewMode,
        kustomizeCommand: projectConfig.settings.kustomizeCommand && applicationConfig.settings?.kustomizeCommand,
        loadLastProjectOnStartup: Boolean(
          projectConfig.settings.loadLastProjectOnStartup && applicationConfig.settings?.loadLastProjectOnStartup
        ),
        hideExcludedFilesInFileExplorer: Boolean(
          projectConfig.settings.hideExcludedFilesInFileExplorer &&
            applicationConfig.settings?.hideExcludedFilesInFileExplorer
        ),
        isClusterSelectorVisible: Boolean(
          projectConfig.settings.isClusterSelectorVisible && applicationConfig.settings?.isClusterSelectorVisible
        ),
      };
    }
    validConfig.scanExcludes = projectConfig.scanExcludes && applicationConfig.scanExcludes;
    validConfig.fileIncludes = projectConfig.fileIncludes && applicationConfig.fileIncludes;
    validConfig.folderReadsMaxDepth = projectConfig.folderReadsMaxDepth && applicationConfig.folderReadsMaxDepth;
    return validConfig;
  }
);
