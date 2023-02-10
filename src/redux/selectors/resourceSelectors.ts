import {useMemo} from 'react';

import {useAppSelector} from '@redux/hooks';
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

import {createDeepEqualSelector} from './utils';

export const createResourceSelector = <Storage extends ResourceStorage>(storage: Storage) => {
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

export const useResource = <Storage extends ResourceStorage>(
  resourceIdentifier?: ResourceIdentifier<Storage>
): K8sResource<Storage> | undefined => {
  const resourceSelector = useMemo(
    () => (resourceIdentifier?.storage ? createResourceSelector(resourceIdentifier.storage) : undefined),
    [resourceIdentifier?.storage]
  );
  return useAppSelector(state =>
    resourceIdentifier?.id && resourceSelector ? resourceSelector(state, resourceIdentifier.id) : undefined
  );
};

export const createResourceContentSelector = <Storage extends ResourceStorage>(storage: Storage) => {
  return createDeepEqualSelector(
    [
      (state: RootState) => state.main.resourceContentMapByStorage[storage],
      (state: RootState, resourceId: string) => resourceId,
    ],
    (resourceContentMap, resourceId): ResourceContent<Storage> | undefined => {
      return resourceContentMap[resourceId];
    }
  );
};

export const createResourceMetaSelector = <Storage extends ResourceStorage>(storage: Storage) => {
  return createDeepEqualSelector(
    [
      (state: RootState) => state.main.resourceMetaMapByStorage[storage],
      (state: RootState, resourceId: string) => resourceId,
    ],
    (resourceMetaMap, resourceId): ResourceMeta<Storage> | undefined => {
      return resourceMetaMap[resourceId];
    }
  );
};

export const useResourceMeta = <Storage extends ResourceStorage>(
  resourceIdentifier?: ResourceIdentifier<Storage>
): ResourceMeta<Storage> | undefined => {
  const resourceMetaSelector = useMemo(
    () => (resourceIdentifier?.storage ? createResourceMetaSelector(resourceIdentifier.storage) : undefined),
    [resourceIdentifier?.storage]
  );
  return useAppSelector(state =>
    resourceIdentifier?.id && resourceMetaSelector ? resourceMetaSelector(state, resourceIdentifier.id) : undefined
  );
};

export const useSelectedResourceMeta = (): ResourceMeta | undefined => {
  const resourceIdentifier = useAppSelector(state =>
    state.main.selection?.type === 'resource' ? state.main.selection?.resourceIdentifier : undefined
  );
  return useResourceMeta(resourceIdentifier);
};

export const useResourceContent = <Storage extends ResourceStorage>(
  resourceIdentifier?: ResourceIdentifier<Storage>
): ResourceContent<Storage> | undefined => {
  const resourceContentSelector = useMemo(
    () => (resourceIdentifier?.storage ? createResourceContentSelector(resourceIdentifier.storage) : undefined),
    [resourceIdentifier?.storage]
  );
  return useAppSelector(state =>
    resourceIdentifier?.id && resourceContentSelector
      ? resourceContentSelector(state, resourceIdentifier.id)
      : undefined
  );
};

export const useSelectedResource = (): K8sResource | undefined => {
  const resourceIdentifier = useAppSelector(state =>
    state.main.selection?.type === 'resource' ? state.main.selection?.resourceIdentifier : undefined
  );
  return useResource(resourceIdentifier);
};

export const useSelectedResourceContent = (): ResourceContent | undefined => {
  const resourceIdentifier = useAppSelector(state =>
    state.main.selection?.type === 'resource' ? state.main.selection?.resourceIdentifier : undefined
  );
  return useResourceContent(resourceIdentifier);
};

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
