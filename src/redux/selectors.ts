import _, {merge} from 'lodash';
import {createSelector} from 'reselect';

import {mapKeyValuesFromNestedObjects} from '@utils/objects';

import {getResourceKindHandler} from '@src/kindhandlers';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AppState} from '@shared/models/appState';
import {AppConfig, HelmPreviewConfiguration, ProjectConfig} from '@shared/models/config';
import {HelmValuesFile} from '@shared/models/helm';
import {ResourceMap, ResourceMetaMap, ResourceStorageKey} from '@shared/models/k8sResource';
import {AnyOrigin} from '@shared/models/origin';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';
import {RootState} from '@shared/models/rootState';
import {Colors} from '@shared/styles/colors';
import {isDefined} from '@shared/utils/filter';

import {isKustomizationResource} from './services/kustomize';
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
export const activeResourceMapSelector = createSelector(
  (state: RootState) => state,
  (state): ResourceMap<AnyOrigin> => {
    if (state.main.clusterConnection) {
      return merge(state.main.resourceMetaStorage.cluster, state.main.resourceContentStorage.cluster);
    }
    if (state.main.preview) {
      return merge(state.main.resourceMetaStorage.preview, state.main.resourceContentStorage.preview);
    }
    return merge(state.main.resourceMetaStorage.local, state.main.resourceContentStorage.local);
  }
);

export const activeResourceMetaMapSelector = createSelector(
  (state: RootState) => state,
  (state): ResourceMetaMap<AnyOrigin> => {
    if (state.main.clusterConnection) {
      return state.main.resourceMetaStorage.cluster;
    }
    if (state.main.preview) {
      return state.main.resourceMetaStorage.preview;
    }
    return state.main.resourceMetaStorage.local;
  }
);

export const resourceMapSelector = createSelector(
  [(state: RootState) => state, (state: RootState, resourceStorage: ResourceStorageKey) => resourceStorage],
  (state, resourceStorage) => {
    return merge(state.main.resourceMetaStorage[resourceStorage], state.main.resourceContentStorage[resourceStorage]);
  }
);

export const activeResourceStorageKeySelector = createSelector(
  (state: RootState) => state,
  (state): ResourceStorageKey => {
    if (state.main.clusterConnection) {
      return 'cluster';
    }
    if (state.main.preview) {
      return 'preview';
    }
    return 'local';
  }
);

export const activeResourceCountSelector = createSelector(
  (state: RootState) => state,
  state => {
    const activeResourceMetaMap = activeResourceMetaMapSelector(state);
    return Object.keys(activeResourceMetaMap).length;
  }
);

export const resourceSelector = createSelector(
  [
    (state: RootState) => state.main,
    (state: RootState, resourceId: string) => resourceId,
    (state: RootState, resourceId: string, resourceStorage: ResourceStorageKey) => resourceStorage,
  ],
  (mainState, resourceId, resourceStorage) => {
    const resourceMeta = mainState.resourceMetaStorage[resourceStorage][resourceId];
    const resourceContent = mainState.resourceContentStorage[resourceStorage][resourceId];
    return merge(resourceMeta, resourceContent);
  }
);

export const selectedResourceSelector = createSelector(
  (state: RootState) => state,
  state => {
    const selection = state.main.selection;
    if (!selection || selection.type !== 'resource') {
      return undefined;
    }
    return resourceSelector(state, selection.resourceId, selection.resourceStorage);
  }
);

export const allResourcesMetaSelector = createSelector(
  (state: RootState) => state.main,
  mainState => {
    // TODO: maybe we should have a constant for the ResourceStorageKey type so we could map the values?
    return [
      ...Object.values(mainState.resourceMetaStorage.local),
      ...Object.values(mainState.resourceMetaStorage.preview),
      ...Object.values(mainState.resourceMetaStorage.cluster),
      ...Object.values(mainState.resourceMetaStorage.transient),
    ];
  }
);

export const allResourceKindsSelector = createSelector(
  (state: RootState) => state,
  state => {
    const knownResourceKinds = knownResourceKindsSelector(state);
    const allResources = allResourcesMetaSelector(state);
    return allResources.filter(r => !knownResourceKinds.includes(r.kind)).map(r => r.kind);
  }
);

export const allResourceLabelsSelector = createSelector(
  (state: RootState) => state,
  state => {
    const allResources = allResourcesMetaSelector(state);
    return mapKeyValuesFromNestedObjects(allResources, resource => resource.labels || {});
  }
);

export const allResourceAnnotationsSelector = createSelector(
  (state: RootState) => state,
  state => {
    const allResources = allResourcesMetaSelector(state);
    return mapKeyValuesFromNestedObjects(allResources, resource => resource.annotations || {});
  }
);

export const previewedKustomizationSelector = createSelector(
  (state: RootState) => state,
  state => {
    const preview = state.main.preview;
    if (!preview || preview.type !== 'kustomize') {
      return undefined;
    }
    return resourceSelector(state, preview.kustomizationId, 'local');
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

export const kustomizationsSelector = createSelector(
  [
    (state: RootState) => state.main.resourceMetaStorage.local,
    (state: RootState) => state.main.resourceContentStorage.local,
  ],
  (resourceMetaMap, resourceContentMap) => {
    return Object.values(resourceMetaMap)
      .filter(resource => isKustomizationResource(resource))
      .map(resource => merge(resource, resourceContentMap[resource.id]));
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
