import _, {merge} from 'lodash';
import {createSelector} from 'reselect';

import {mapKeyValuesFromNestedObjects} from '@utils/objects';
import {isResourcePassingFilter} from '@utils/resources';

import {getResourceKindHandler} from '@src/kindhandlers';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AppState} from '@shared/models/appState';
import {AppConfig, HelmPreviewConfiguration, ProjectConfig} from '@shared/models/config';
import {FileEntry} from '@shared/models/fileEntry';
import {HelmValuesFile} from '@shared/models/helm';
import {
  K8sResource,
  ResourceContent,
  ResourceContentMap,
  ResourceContentStorage,
  ResourceMap,
  ResourceMeta,
  ResourceMetaMap,
  ResourceMetaStorage,
  ResourceStorageKey,
} from '@shared/models/k8sResource';
import {AnyOrigin, OriginFromStorage} from '@shared/models/origin';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';
import {RootState} from '@shared/models/rootState';
import {
  ResourceSelection,
  isFileSelection,
  isPreviewConfigurationSelection,
  isResourceSelection,
} from '@shared/models/selection';
import {Colors} from '@shared/styles/colors';
import {isDefined} from '@shared/utils/filter';

import {isKustomizationResource} from './services/kustomize';
import {mergeConfigs, populateProjectConfig} from './services/projectConfig';

export const rootFolderSelector = createSelector(
  (state: RootState) => state.main.fileMap,
  fileMap => fileMap[ROOT_FILE_ENTRY]?.filePath
);

export const unknownResourcesSelector = (state: RootState) => {
  const activeResourceMap = activeResourceMapSelector(state);
  const unknownResources = Object.values(activeResourceMap).filter(
    resource =>
      !isKustomizationResource(resource) &&
      !getResourceKindHandler(resource.kind) &&
      !resource.name.startsWith('Patch:')
  );
  return unknownResources;
};

export const filteredResourceSelector = createSelector(
  (state: RootState) => state.main.resourceFilter,
  (state: RootState) => activeResourceMapSelector(state),
  (filter, activeResourceMap) =>
    Object.values(activeResourceMap).filter(resource => isResourcePassingFilter(resource, filter))
);

export const filteredResourceMapSelector = createSelector(
  (state: RootState) => state.main.resourceFilter,
  (state: RootState) => activeResourceMapSelector(state),
  (filter, activeResourceMap) =>
    _.keyBy(
      Object.values(activeResourceMap).filter(resource => isResourcePassingFilter(resource, filter)),
      'id'
    )
);

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

export const activeResourceContentMapSelector = createSelector(
  (state: RootState) => state,
  (state): ResourceContentMap<AnyOrigin> => {
    if (state.main.clusterConnection) {
      return state.main.resourceContentStorage.cluster;
    }
    if (state.main.preview) {
      return state.main.resourceContentStorage.preview;
    }
    return state.main.resourceContentStorage.local;
  }
);

export const selectedResourceWithMapSelector = createSelector(
  (state: RootState) => state,
  (state): {selectedResource: K8sResource | undefined; resourceMap: ResourceMap | undefined} => {
    const selectedResource = selectedResourceSelector(state);
    if (!selectedResource) {
      return {
        selectedResource: undefined,
        resourceMap: undefined,
      };
    }
    const resourceMap = resourceMapSelector(state, selectedResource.origin.storage);
    return {
      selectedResource,
      resourceMap,
    };
  }
);

export const selectedResourceMetaWithMapSelector = createSelector(
  (state: RootState) => state,
  state => {
    const selectedResourceMeta = selectedResourceMetaSelector(state);
    if (!selectedResourceMeta) {
      return {
        selectedResourceMeta: undefined,
        resourceMetaMap: undefined,
      };
    }
    const resourceMetaMap = resourceMetaMapSelector(state, selectedResourceMeta.origin.storage);
    return {
      selectedResourceMeta,
      resourceMetaMap,
    };
  }
);

// function getResourceMetaMap<Storage extends AnyOrigin['storage']>(
//   resourceMetaStorage: ResourceMetaStorage,
//   storageKey: Storage
// ): ResourceMetaMap<OriginFromStorage<Storage>> {
//   return resourceMetaStorage[storageKey];
// }

export function resourceMapSelector<Storage extends AnyOrigin['storage']>(
  state: RootState,
  resourceStorage: Storage
): ResourceMap<OriginFromStorage<Storage>> {
  return merge(state.main.resourceMetaStorage[resourceStorage], state.main.resourceContentStorage[resourceStorage]);
}

export function resourceMetaMapSelector<Storage extends AnyOrigin['storage']>(
  state: RootState,
  resourceStorage: Storage
): ResourceMetaMap<OriginFromStorage<Storage>> {
  return state.main.resourceMetaStorage[resourceStorage];
}

export function resourceContentMapSelector<Storage extends AnyOrigin['storage']>(
  state: RootState,
  resourceStorage: Storage
): ResourceContentMap<OriginFromStorage<Storage>> {
  return state.main.resourceContentStorage[resourceStorage];
}

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

/**
 * Usage:
 */
export function resourceSelector<Storage extends AnyOrigin['storage']>(
  state: RootState | {resourceMetaStorage: ResourceMetaStorage; resourceContentStorage: ResourceContentStorage},
  args: {id: string; storage: Storage | undefined} | ResourceSelection<Storage>
): K8sResource<OriginFromStorage<Storage>> | undefined {
  const resourceId = 'id' in args ? args.id : args.resourceId;
  const resourceStorage = 'storage' in args ? args.storage : args.resourceStorage;
  if (resourceStorage === undefined) {
    return undefined;
  }
  const resourceMetaMap =
    'main' in state ? state.main.resourceMetaStorage[resourceStorage] : state.resourceMetaStorage[resourceStorage];
  const resourceContentMap =
    'main' in state
      ? state.main.resourceContentStorage[resourceStorage]
      : state.resourceContentStorage[resourceStorage];
  const resourceMeta = resourceMetaMap[resourceId];
  const resourceContent = resourceContentMap[resourceId];
  return merge(resourceMeta, resourceContent);
}

export function resourceMetaSelector<Storage extends AnyOrigin['storage']>(
  state: RootState,
  resourceId: string,
  resourceStorage: Storage | undefined
): ResourceMeta<OriginFromStorage<Storage>> | undefined {
  if (resourceStorage === undefined) {
    return undefined;
  }
  const resourceMetaMap = state.main.resourceMetaStorage[resourceStorage];
  return resourceMetaMap[resourceId];
}

export function resourceContentSelector<Storage extends AnyOrigin['storage']>(
  state: RootState,
  resourceId: string,
  resourceStorage: Storage | undefined
): ResourceContent<OriginFromStorage<Storage>> | undefined {
  if (resourceStorage === undefined) {
    return undefined;
  }
  const resourceContentMap = state.main.resourceContentStorage[resourceStorage];
  return resourceContentMap[resourceId];
}

export const selectedResourceSelector = createSelector(
  (state: RootState) => state,
  state => {
    const selection = state.main.selection;
    if (!isResourceSelection(selection)) {
      return undefined;
    }
    return resourceSelector(state, selection);
  }
);

export const selectedResourceMetaSelector = createSelector(
  (state: RootState) => state,
  state => {
    const selection = state.main.selection;
    if (!isResourceSelection(selection)) {
      return undefined;
    }
    return resourceMetaSelector(state, selection.resourceId, selection.resourceStorage);
  }
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
    return resourceSelector(state, {id: preview.kustomizationId, storage: 'local'});
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
    return rootFileEntry.filePath;
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
