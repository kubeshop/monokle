import {createSelector} from 'reselect';

import {isKustomizationResource} from '@redux/services/kustomize';
import {joinK8sResource} from '@redux/services/resource';

import {
  K8sResource,
  ResourceContent,
  ResourceIdentifier,
  ResourceMeta,
  ResourceStorage,
} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';
import {isResourceSelection} from '@shared/models/selection';

import {createDeepEqualSelector} from './utils';

const createResourceSelector = <Storage extends ResourceStorage>(storage: Storage) => {
  return createDeepEqualSelector(
    [
      (state: RootState) => state.main.resourceMetaMapByStorage[storage],
      (state: RootState) => state.main.resourceContentMapByStorage[storage],
      (state: RootState, resourceId: string) => resourceId,
    ],
    (resourceMetaMap, resourceContentMap, resourceId): K8sResource<Storage> | undefined => {
      const meta = resourceMetaMap[resourceId];
      const content = resourceContentMap[resourceId];
      if (!meta || !content) {
        return undefined;
      }
      return joinK8sResource(meta, content);
    }
  );
};

export const localResourceSelector = createResourceSelector('local');
export const clusterResourceSelector = createResourceSelector('cluster');
export const previewResourceSelector = createResourceSelector('preview');
export const transientResourceSelector = createResourceSelector('transient');
export const resourceSelector = (state: RootState, resourceIdentifier: ResourceIdentifier) => {
  if (resourceIdentifier.storage === 'local') {
    return localResourceSelector(state, resourceIdentifier.id);
  }
  if (resourceIdentifier.storage === 'cluster') {
    return clusterResourceSelector(state, resourceIdentifier.id);
  }
  if (resourceIdentifier.storage === 'preview') {
    return previewResourceSelector(state, resourceIdentifier.id);
  }
  if (resourceIdentifier.storage === 'transient') {
    return transientResourceSelector(state, resourceIdentifier.id);
  }
};

export const resourceMetaSelector = createSelector(
  [
    (state: RootState) => state.main.resourceMetaMapByStorage,
    (state: RootState, resourceIdentifier: ResourceIdentifier) => resourceIdentifier,
  ],
  (resourceMetaMapByStorage, resourceIdentifier): ResourceMeta<typeof resourceIdentifier.storage> => {
    return resourceMetaMapByStorage[resourceIdentifier.storage][resourceIdentifier.id];
  }
);

export const resourceContentSelector = createSelector(
  [
    (state: RootState) => state.main.resourceContentMapByStorage,
    (state: RootState, resourceIdentifier: ResourceIdentifier) => resourceIdentifier,
  ],
  (resourceContentMapByStorage, resourceIdentifier): ResourceContent<typeof resourceIdentifier.storage> => {
    return resourceContentMapByStorage[resourceIdentifier.storage][resourceIdentifier.id];
  }
);

export const selectedResourceSelector = createSelector(
  (state: RootState) => {
    const selection = state.main.selection;
    if (!isResourceSelection(selection)) {
      return undefined;
    }
    return resourceSelector(state, selection.resourceIdentifier);
  },
  resource => resource
);

export const selectedResourceMetaSelector = createSelector(
  (state: RootState) => {
    const selection = state.main.selection;
    if (!isResourceSelection(selection)) {
      return undefined;
    }
    return resourceMetaSelector(state, selection.resourceIdentifier);
  },
  resource => resource
);

export const selectedResourceContentSelector = createSelector(
  (state: RootState) => {
    const selection = state.main.selection;
    if (!isResourceSelection(selection)) {
      return undefined;
    }
    return resourceContentSelector(state, selection.resourceIdentifier);
  },
  resource => resource
);

export const kustomizationsSelector = createDeepEqualSelector(
  [
    (state: RootState) => state.main.resourceMetaMapByStorage.local,
    (state: RootState) => state.main.resourceContentMapByStorage.local,
  ],
  (resourceMetaMap, resourceContentMap) => {
    return Object.values(resourceMetaMap)
      .filter(resource => isKustomizationResource(resource))
      .map(resource => joinK8sResource(resource, resourceContentMap[resource.id]));
  }
);

export const previewedKustomizationSelector = createDeepEqualSelector(
  [
    (state: RootState) => state.main.resourceMetaMapByStorage.local,
    (state: RootState) => state.main.resourceContentMapByStorage.local,
    (state: RootState) => state.main.preview,
  ],
  (resourceMetaMap, resourceContentMap, preview) => {
    if (!preview || preview.type !== 'kustomize') {
      return undefined;
    }
    const meta = resourceMetaMap[preview.kustomizationId];
    const content = resourceContentMap[preview.kustomizationId];
    if (!meta || !content) {
      return undefined;
    }
    return joinK8sResource(meta, content);
  }
);
