import _, {merge} from 'lodash';
import {createSelector} from 'reselect';

import {getResourceKindHandler} from '@src/kindhandlers';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AppState} from '@shared/models/appState';
import {AppConfig, HelmPreviewConfiguration, ProjectConfig} from '@shared/models/config';
import {HelmValuesFile} from '@shared/models/helm';
import {ResourceMetaMap} from '@shared/models/k8sResource';
import {AnyOrigin} from '@shared/models/origin';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';
import {RootState} from '@shared/models/rootState';
import {Colors} from '@shared/styles/colors';
import {isDefined} from '@shared/utils/filter';

import {mergeConfigs, populateProjectConfig} from './services/projectConfig';

export const rootFolderSelector = createSelector(
  (state: RootState) => state.main.fileMap,
  fileMap => fileMap[ROOT_FILE_ENTRY]?.filePath
);

// export const unknownResourcesSelector = (state: RootState) => {
//   const isInPreviewMode = isInPreviewModeSelector(state);
//   const unknownResources = Object.values(state.main.resourceMap).filter(
//     resource =>
//       !isKustomizationResource(resource) &&
//       !getResourceKindHandler(resource.kind) &&
//       !resource.name.startsWith('Patch:') &&
//       (isInPreviewMode ? resource.filePath.startsWith(PREVIEW_PREFIX) : true)
//   );
//   return unknownResources;
// };

export const selectedResourceSelector = createSelector(
  (state: RootState) => state.main.resourceMetaStorage.local,
  (state: RootState) => state.main.resourceContentStorage.local,
  (state: RootState) => state.main.selection,
  (resourceMetaMap, resourceContentMap, selection) => {
    const resourceId = selection?.type === 'resource' ? selection.resourceId : undefined;
    if (!resourceId) {
      return undefined;
    }
    const resourceMeta = resourceMetaMap[resourceId];
    const resourceContent = resourceContentMap[resourceId];
    return merge(resourceMeta, resourceContent);
  }
);

// export const filteredResourceSelector = createSelector(
//   (state: RootState) => state.main.resourceMap,
//   (state: RootState) => state.main.resourceFilter,
//   (resourceMap, filter) => Object.values(resourceMap).filter(resource => isResourcePassingFilter(resource, filter))
// );

// export const filteredResourceMapSelector = createSelector(
//   (state: RootState) => state,
//   state =>
//     _.keyBy(
//       Object.values(state.main.resourceMap).filter(resource =>
//         isResourcePassingFilter(resource, state.main.resourceFilter, isInPreviewModeSelector(state))
//       ),
//       'id'
//     )
// );

// export const kustomizationsSelector = createSelector(allResourcesSelector, resources =>
//   resources.filter((r: K8sResource) => isKustomizationResource(r))
// );

// TODO: should we merge the Unsaved storage into these or do we handle those differently directly in the Navigator?
export const activeResourceMapSelector = (state: AppState) => {
  if (state.clusterConnection) {
    return merge(state.resourceMetaStorage.cluster, state.resourceContentStorage.cluster);
  }
  if (state.preview) {
    return merge(state.resourceMetaStorage.preview, state.resourceContentStorage.preview);
  }
  return merge(state.resourceMetaStorage.local, state.resourceContentStorage.local);
};

export const activeResourceMetaMapSelector = createSelector(
  (state: RootState) => state.main,
  (mainState): ResourceMetaMap<AnyOrigin> => {
    if (mainState.clusterConnection) {
      return mainState.resourceMetaStorage.cluster;
    }
    if (mainState.preview) {
      return mainState.resourceMetaStorage.preview;
    }
    return mainState.resourceMetaStorage.local;
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
    if (_.isBoolean(config.kubeConfig.isPathValid)) {
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
