import {keyBy} from 'lodash';
import {createSelector} from 'reselect';

import {isKustomizationResource} from '@redux/services/kustomize';
import {joinK8sResourceMap} from '@redux/services/resource';

import {mapKeyValuesFromNestedObjects} from '@utils/objects';
import {isResourcePassingFilter} from '@utils/resources';

import {getResourceKindHandler} from '@src/kindhandlers';

import {ResourceContentMap, ResourceMap, ResourceMetaMap, ResourceStorage} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';

import {knownResourceKindsSelector} from './resourceKindSelectors';
import {createDeepEqualSelector} from './utils';

export const createResourceMapSelector = <Storage extends ResourceStorage>(storage: Storage) => {
  return createDeepEqualSelector(
    [
      (state: RootState) => state.main.resourceMetaMapByStorage[storage],
      (state: RootState) => state.main.resourceContentMapByStorage[storage],
    ],
    (resourceMetaMap, resourceContentMap): ResourceMap<Storage> => {
      return joinK8sResourceMap(resourceMetaMap, resourceContentMap);
    }
  );
};
export const localResourceMapSelector = createResourceMapSelector('local');
export const clusterResourceMapSelector = createResourceMapSelector('cluster');
export const previewResourceMapSelector = createResourceMapSelector('preview');
export const transientResourceMapSelector = createResourceMapSelector('transient');
export const resourceMapSelector = <Storage extends ResourceStorage>(state: RootState, storage: Storage) => {
  if (storage === 'local') {
    return localResourceMapSelector(state);
  }
  if (storage === 'cluster') {
    return clusterResourceMapSelector(state);
  }
  if (storage === 'preview') {
    return previewResourceMapSelector(state);
  }
  if (storage === 'transient') {
    return transientResourceMapSelector(state);
  }
};
// TODO: should we merge the Unsaved storage into these or do we handle those differently directly in the Navigator?
export const activeResourceMapSelector = createDeepEqualSelector(
  [
    (state: RootState) => state.main.resourceMetaMapByStorage,
    (state: RootState) => state.main.resourceContentMapByStorage,
    (state: RootState) => state.main.clusterConnection,
    (state: RootState) => state.main.preview,
  ],
  (resourceMetaStorage, resourceContentStorage, clusterConnection, preview): ResourceMap<ResourceStorage> => {
    if (clusterConnection) {
      return joinK8sResourceMap(resourceMetaStorage.cluster, resourceContentStorage.cluster);
    }
    if (preview) {
      return joinK8sResourceMap(resourceMetaStorage.preview, resourceContentStorage.preview);
    }
    return joinK8sResourceMap(resourceMetaStorage.local, resourceContentStorage.local);
  }
);

// Resource Meta Map
export const createResourceMetaMapSelector = <Storage extends ResourceStorage>(storage: Storage) => {
  return createSelector(
    (state: RootState) => state.main.resourceMetaMapByStorage[storage],
    (resourceMetaMap): ResourceMetaMap<Storage> => resourceMetaMap
  );
};
export const localResourceMetaMapSelector = createResourceMetaMapSelector('local');
export const clusterResourceMetaMapSelector = createResourceMetaMapSelector('cluster');
export const previewResourceMetaMapSelector = createResourceMetaMapSelector('preview');
export const transientResourceMetaMapSelector = createResourceMetaMapSelector('transient');
export const resourceMetaMapSelector = <Storage extends ResourceStorage>(
  state: RootState,
  storage: Storage
): ResourceMetaMap<Storage> | undefined => {
  if (storage === 'local') {
    return localResourceMetaMapSelector(state) as ResourceMetaMap<Storage>;
  }
  if (storage === 'cluster') {
    return clusterResourceMetaMapSelector(state) as ResourceMetaMap<Storage>;
  }
  if (storage === 'preview') {
    return previewResourceMetaMapSelector(state) as ResourceMetaMap<Storage>;
  }
  if (storage === 'transient') {
    return transientResourceMetaMapSelector(state) as ResourceMetaMap<Storage>;
  }
};
export const activeResourceMetaMapSelector = createSelector(
  [
    (state: RootState) => state.main.resourceMetaMapByStorage,
    (state: RootState) => state.main.clusterConnection,
    (state: RootState) => state.main.preview,
  ],
  (resourceMetaStorage, clusterConnection, preview): ResourceMetaMap<ResourceStorage> => {
    if (clusterConnection) {
      return resourceMetaStorage.cluster;
    }
    if (preview) {
      return resourceMetaStorage.preview;
    }
    return resourceMetaStorage.local;
  }
);

// Resource Content Map
export const createResourceContentMapSelector = <Storage extends ResourceStorage>(storage: Storage) => {
  return createSelector(
    (state: RootState) => state.main.resourceContentMapByStorage[storage],
    (resourceContentMap): ResourceContentMap<Storage> => resourceContentMap
  );
};
export const localResourceContentMapSelector = createResourceContentMapSelector('local');
export const clusterResourceContentMapSelector = createResourceContentMapSelector('cluster');
export const previewResourceContentMapSelector = createResourceContentMapSelector('preview');
export const transientResourceContentMapSelector = createResourceContentMapSelector('transient');
export const resourceContentMapSelector = <Storage extends ResourceStorage>(state: RootState, storage: Storage) => {
  if (storage === 'local') {
    return localResourceContentMapSelector(state);
  }
  if (storage === 'cluster') {
    return clusterResourceContentMapSelector(state);
  }
  if (storage === 'preview') {
    return previewResourceContentMapSelector(state);
  }
  if (storage === 'transient') {
    return transientResourceContentMapSelector(state);
  }
};
export const activeResourceContentMapSelector = createSelector(
  [
    (state: RootState) => state.main.resourceContentMapByStorage,
    (state: RootState) => state.main.clusterConnection,
    (state: RootState) => state.main.preview,
  ],
  (resourceContentStorage, clusterConnection, preview): ResourceContentMap<ResourceStorage> => {
    if (clusterConnection) {
      return resourceContentStorage.cluster;
    }
    if (preview) {
      return resourceContentStorage.preview;
    }
    return resourceContentStorage.local;
  }
);

export const activeResourceStorageSelector = createSelector(
  (state: RootState) => state,
  (state): ResourceStorage => {
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
  activeResourceMetaMapSelector,
  activeResourceMetaMap => Object.keys(activeResourceMetaMap).length
);

export const filteredResourceSelector = createDeepEqualSelector(
  (state: RootState) => state.main.resourceFilter,
  activeResourceMapSelector,
  (filter, activeResourceMap) =>
    Object.values(activeResourceMap).filter(resource => isResourcePassingFilter(resource, filter))
);

export const filteredResourceMapSelector = createDeepEqualSelector(
  (state: RootState) => state.main.resourceFilter,
  activeResourceMapSelector,
  (filter, activeResourceMap) =>
    keyBy(
      Object.values(activeResourceMap).filter(resource => isResourcePassingFilter(resource, filter)),
      'id'
    )
);

export const unknownResourcesSelector = createDeepEqualSelector(activeResourceMapSelector, activeResourceMap => {
  const unknownResources = Object.values(activeResourceMap).filter(
    resource =>
      !isKustomizationResource(resource) &&
      !getResourceKindHandler(resource.kind) &&
      !resource.name.startsWith('Patch:')
  );
  return unknownResources;
});

export const allResourcesMetaSelector = createDeepEqualSelector(
  (state: RootState) => state.main.resourceMetaMapByStorage,
  resourceMetaStorage => {
    // TODO: maybe we should have a constant for the ResourceStorageKey type so we could map the values?
    return [
      ...Object.values(resourceMetaStorage.local),
      ...Object.values(resourceMetaStorage.preview),
      ...Object.values(resourceMetaStorage.cluster),
      ...Object.values(resourceMetaStorage.transient),
    ];
  }
);

export const allResourceKindsSelector = createDeepEqualSelector(
  [knownResourceKindsSelector, allResourcesMetaSelector],
  (knownResourceKinds, allResourceMetas) => {
    return allResourceMetas.filter(r => !knownResourceKinds.includes(r.kind)).map(r => r.kind);
  }
);

export const allResourceLabelsSelector = createSelector(allResourcesMetaSelector, allResourceMetas => {
  return mapKeyValuesFromNestedObjects(allResourceMetas, resource => resource.labels || {});
});

export const allResourceAnnotationsSelector = createSelector(allResourcesMetaSelector, allResourceMetas => {
  return mapKeyValuesFromNestedObjects(allResourceMetas, resource => resource.annotations || {});
});
