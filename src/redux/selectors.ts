import _ from 'lodash';
import {createSelector} from 'reselect';

import {CLUSTER_DIFF_PREFIX, PREVIEW_PREFIX, ROOT_FILE_ENTRY} from '@constants/constants';

import {RootState} from '@models/rootstate';

import {isKustomizationResource} from '@redux/services/kustomize';

import {isDefined} from '@utils/filter';
import {isResourcePassingFilter} from '@utils/resources';

import {getResourceKindHandler} from '@src/kindhandlers';

import {
  AppConfig,
  AppState,
  HelmPreviewConfiguration,
  HelmValuesFile,
  K8sResource,
  ProjectConfig,
  ResourceKindHandler,
} from '@monokle-desktop/shared';

import Colors from '../styles/Colors';
import {mergeConfigs, populateProjectConfig} from './services/projectConfig';
import {isUnsavedResource} from './services/resource';

export const rootFolderSelector = createSelector(
  (state: RootState) => state.main.fileMap,
  fileMap => fileMap[ROOT_FILE_ENTRY]?.filePath
);

export const allResourcesSelector = createSelector(
  (state: RootState) => state.main.resourceMap,
  resourceMap => Object.values(resourceMap)
);

export const activeResourcesSelector = (state: RootState) => {
  const resources = Object.values(state.main.resourceMap);
  const previewResourceId = state.main.previewResourceId;
  const previewValuesFileId = state.main.previewValuesFileId;
  const previewConfigurationId = state.main.previewConfigurationId;
  const previewCommandId = state.main.previewCommandId;

  return resources.filter(
    r =>
      ((previewResourceId === undefined &&
        previewValuesFileId === undefined &&
        previewConfigurationId === undefined &&
        previewCommandId === undefined) ||
        r.filePath.startsWith(PREVIEW_PREFIX)) &&
      !r.filePath.startsWith(CLUSTER_DIFF_PREFIX) &&
      !r.name.startsWith('Patch:')
  );
};

export const unknownResourcesSelector = (state: RootState) => {
  const isInPreviewMode = isInPreviewModeSelector(state);
  const unknownResources = Object.values(state.main.resourceMap).filter(
    resource =>
      !isKustomizationResource(resource) &&
      !getResourceKindHandler(resource.kind) &&
      !resource.name.startsWith('Patch:') &&
      (isInPreviewMode ? resource.filePath.startsWith(PREVIEW_PREFIX) : true)
  );
  return unknownResources;
};

export const unsavedResourcesSelector = createSelector(
  (state: RootState) => state.main.resourceMap,
  resourceMap => Object.values(resourceMap).filter(isUnsavedResource)
);

export const selectedResourceSelector = createSelector(
  (state: RootState) => state.main.resourceMap,
  (state: RootState) => state.main.selectedResourceId,
  (resourceMap, selectedResourceId) => (selectedResourceId ? resourceMap[selectedResourceId] : undefined)
);

export const filteredResourceSelector = createSelector(
  (state: RootState) => state.main.resourceMap,
  (state: RootState) => state.main.resourceFilter,
  (resourceMap, filter) => Object.values(resourceMap).filter(resource => isResourcePassingFilter(resource, filter))
);

export const filteredResourceMapSelector = createSelector(
  (state: RootState) => state,
  state =>
    _.keyBy(
      Object.values(state.main.resourceMap).filter(resource =>
        isResourcePassingFilter(resource, state.main.resourceFilter, isInPreviewModeSelector(state))
      ),
      'id'
    )
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

export const selectHelmValues = (state: AppState, id?: string): HelmValuesFile | undefined => {
  if (!id) return undefined;
  return state.helmValuesMap[id];
};

export const selectHelmConfig = (state: RootState, id?: string): HelmPreviewConfiguration | undefined => {
  if (!id) return undefined;
  return state.config.projectConfig?.helm?.previewConfigurationMap?.[id] ?? undefined;
};

export const isInPreviewModeSelector = (state: RootState) =>
  Boolean(state.main.previewResourceId) ||
  Boolean(state.main.previewValuesFileId) ||
  Boolean(state.main.previewConfigurationId) ||
  Boolean(state.main.previewCommandId);

export const isInClusterModeSelector = createSelector(
  (state: RootState) => state,
  state => {
    const kubeConfig = selectCurrentKubeConfig(state);
    const previewId = state.main.previewResourceId;
    return kubeConfig && isDefined(previewId) && previewId === kubeConfig.currentContext;
  }
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

export const kubeConfigContextSelector = createSelector(
  (state: RootState) => state.config,
  config => {
    return currentKubeContext(config);
  }
);

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

    if (!config.projectConfig?.kubeConfig?.currentContext) {
      return [];
    }

    return config.clusterAccess?.filter(ca => ca.context === currentContext) || [];
  }
);

export const kubeConfigPathSelector = createSelector(
  (state: RootState) => state.config,
  config => {
    if (config.projectConfig?.kubeConfig?.path) {
      return config.projectConfig?.kubeConfig?.path;
    }
    if (config.kubeConfig.path) {
      return config.kubeConfig.path;
    }
    return '';
  }
);

export const kubeConfigPathValidSelector = createSelector(
  (state: RootState) => state.config,
  config => {
    if (_.isBoolean(config.projectConfig?.kubeConfig?.isPathValid)) {
      return Boolean(config.projectConfig?.kubeConfig?.isPathValid);
    }
    if (_.isBoolean(config.kubeConfig.isPathValid)) {
      return Boolean(config.kubeConfig.isPathValid);
    }
    return false;
  }
);

export const selectCurrentKubeConfig = (state: RootState) => {
  return state.config.projectConfig?.kubeConfig ?? state.config.kubeConfig;
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
