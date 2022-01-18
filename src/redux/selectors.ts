import {createSelector} from 'reselect';

import {CLUSTER_DIFF_PREFIX, PREVIEW_PREFIX, ROOT_FILE_ENTRY} from '@constants/constants';

import {ProjectConfig} from '@models/appconfig';
import {K8sResource} from '@models/k8sresource';

import {isKustomizationResource} from '@redux/services/kustomize';

import {mergeConfigs, populateProjectConfig} from './services/projectConfig';
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
  ({main, config}) => {
    const kubeConfigPath = config.projectConfig?.kubeConfig?.path || config.kubeConfig.path;
    if (kubeConfigPath) {
      return Boolean(main.previewResourceId && main.previewResourceId.endsWith(kubeConfigPath));
    }
    return false;
  }
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
    const applicationConfig: ProjectConfig = populateProjectConfig(config);
    const projectConfig: ProjectConfig | null | undefined = config.projectConfig;
    return mergeConfigs(applicationConfig, projectConfig);
  }
);

export const settingsSelector = createSelector(
  (state: RootState) => state,
  state => {
    const currentKubeConfig: ProjectConfig = currentConfigSelector(state);
    return currentKubeConfig.settings || {};
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

export const kubeConfigContextSelector = createSelector(
  (state: RootState) => state,
  state => {
    const currentKubeConfig: ProjectConfig = currentConfigSelector(state);
    return currentKubeConfig.kubeConfig?.currentContext || '';
  }
);

export const kubeConfigContextsSelector = createSelector(
  (state: RootState) => state,
  state => {
    const currentKubeConfig: ProjectConfig = currentConfigSelector(state);
    return currentKubeConfig.kubeConfig?.contexts || [];
  }
);

export const kubeConfigPathSelector = createSelector(
  (state: RootState) => state,
  state => {
    const currentKubeConfig: ProjectConfig = currentConfigSelector(state);
    return currentKubeConfig.kubeConfig?.path || '';
  }
);

export const kubeConfigPathValidSelector = createSelector(
  (state: RootState) => state,
  state => {
    const currentKubeConfig: ProjectConfig = currentConfigSelector(state);
    return currentKubeConfig.kubeConfig?.isPathValid || false;
  }
);
