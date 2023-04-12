import {useMemo} from 'react';

import {createSelector} from '@reduxjs/toolkit';

import {groupBy} from 'lodash';

import {useAppSelector} from '@redux/hooks';
import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';
import {joinK8sResource} from '@redux/services/resource';

import {useRefSelector} from '@utils/hooks';
import {isResourcePassingFilter} from '@utils/resources';

import {
  K8sResource,
  ResourceContent,
  ResourceIdentifier,
  ResourceMeta,
  ResourceStorage,
} from '@shared/models/k8sResource';
import {ResourceNavigatorNode} from '@shared/models/navigator';
import {RootState} from '@shared/models/rootState';

import {
  activeResourceMetaMapSelector,
  activeResourceStorageSelector,
  transientResourceMetaMapSelector,
} from './resourceMapSelectors';
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

const useMemoResourceSelector = <Storage extends ResourceStorage>(storage?: Storage) => {
  return useMemo(() => (storage ? createResourceSelector(storage) : undefined), [storage]);
};

export const useResource = <Storage extends ResourceStorage>(
  resourceIdentifier?: ResourceIdentifier<Storage>
): K8sResource<Storage> | undefined => {
  const resourceSelector = useMemoResourceSelector(resourceIdentifier?.storage);
  return useAppSelector(state =>
    resourceIdentifier?.id && resourceSelector ? resourceSelector(state, resourceIdentifier.id) : undefined
  );
};

export const useResourceRef = <Storage extends ResourceStorage>(
  resourceIdentifier?: ResourceIdentifier<Storage>
): React.MutableRefObject<K8sResource<Storage> | undefined> => {
  const resourceSelector = useMemoResourceSelector(resourceIdentifier?.storage);
  return useRefSelector(state =>
    resourceIdentifier?.id && resourceSelector ? resourceSelector(state, resourceIdentifier.id) : undefined
  );
};

export const useSelectedResource = (): K8sResource | undefined => {
  const resourceIdentifier = useAppSelector(state =>
    state.main.selection?.type === 'resource' ? state.main.selection?.resourceIdentifier : undefined
  );
  return useResource(resourceIdentifier);
};

export const useSelectedResourceRef = (): React.MutableRefObject<K8sResource | undefined> => {
  const resourceIdentifier = useAppSelector(state =>
    state.main.selection?.type === 'resource' ? state.main.selection?.resourceIdentifier : undefined
  );
  return useResourceRef(resourceIdentifier);
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

const useMemoResourceMetaSelector = <Storage extends ResourceStorage>(storage?: Storage) => {
  return useMemo(() => (storage ? createResourceMetaSelector(storage) : undefined), [storage]);
};

export const useResourceMeta = <Storage extends ResourceStorage>(
  resourceIdentifier?: ResourceIdentifier<Storage>
): ResourceMeta<Storage> | undefined => {
  const resourceMetaSelector = useMemoResourceMetaSelector(resourceIdentifier?.storage);
  return useAppSelector(state =>
    resourceIdentifier?.id && resourceMetaSelector ? resourceMetaSelector(state, resourceIdentifier.id) : undefined
  );
};

export const useResourceMetaRef = <Storage extends ResourceStorage>(
  resourceIdentifier?: ResourceIdentifier<Storage>
): React.MutableRefObject<ResourceMeta<Storage> | undefined> => {
  const resourceMetaSelector = useMemoResourceMetaSelector(resourceIdentifier?.storage);
  const resourceMetaRef = useRefSelector(state =>
    resourceIdentifier?.id && resourceMetaSelector ? resourceMetaSelector(state, resourceIdentifier.id) : undefined
  );
  return resourceMetaRef;
};

export const useSelectedResourceMeta = (): ResourceMeta | undefined => {
  const resourceIdentifier = useAppSelector(state =>
    state.main.selection?.type === 'resource' ? state.main.selection?.resourceIdentifier : undefined
  );
  return useResourceMeta(resourceIdentifier);
};

export const useSelectedResourceMetaRef = (): React.MutableRefObject<ResourceMeta | undefined> => {
  const resourceIdentifier = useAppSelector(state =>
    state.main.selection?.type === 'resource' ? state.main.selection?.resourceIdentifier : undefined
  );
  return useResourceMetaRef(resourceIdentifier);
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

/**
 * Selects all resources that should be visible in the navigator, mixing in transient resources and applying filters
 */
export const navigatorResourcesSelector = createSelector(
  [
    activeResourceStorageSelector,
    activeResourceMetaMapSelector,
    transientResourceMetaMapSelector,
    (state: RootState) => state.main.resourceFilter,
  ],
  (activeResourceStorage, activeResourceMetaMap, transientResourceMetaMap, resourceFilter) => {
    const list: ResourceNavigatorNode[] = [];

    return Object.values(activeResourceMetaMap)
      .concat(Object.values(transientResourceMetaMap).filter(r => r.origin.createdIn === activeResourceStorage))
      .filter(
        resource =>
          isResourcePassingFilter(resource, resourceFilter) &&
          !isKustomizationResource(resource) &&
          !isKustomizationPatch(resource)
      );
  }
);

export const resourceNavigatorSelector = createSelector(
  [
    activeResourceStorageSelector,
    navigatorResourcesSelector,
    (state: RootState) => state.ui.navigator.collapsedResourceKinds,
  ],
  (activeResourceStorage, navigatorResources, collapsedResourceKinds) => {
    const list: ResourceNavigatorNode[] = [];

    const groups = groupBy(navigatorResources, 'kind');
    const entries = Object.entries(groups);
    const sortedEntries = entries.sort();

    for (const [kind, kindResources] of sortedEntries) {
      const collapsed = collapsedResourceKinds.indexOf(kind) !== -1;

      list.push({
        type: 'kind',
        name: kind,
        resourceCount: kindResources.length,
      });

      if (collapsed) {
        continue;
      }

      for (const resource of kindResources) {
        list.push({
          type: 'resource',
          identifier: {
            id: resource.id,
            storage: activeResourceStorage,
          },
        });
      }
    }

    return list;
  }
);
