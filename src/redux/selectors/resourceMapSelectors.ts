import {keyBy, size, uniq} from 'lodash';
import {Selector, createSelector} from 'reselect';

import {useAppSelector} from '@redux/hooks';
import {isKustomizationResource} from '@redux/services/kustomize';
import {joinK8sResource} from '@redux/services/resource';

import {useRefSelector} from '@utils/hooks';
import {mapKeyValuesFromNestedObjects} from '@utils/objects';
import {isResourcePassingFilter} from '@utils/resources';

import {getResourceKindHandler} from '@src/kindhandlers';

import {K8sResource, ResourceContentMap, ResourceMetaMap, ResourceStorage} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';
import {isDefined} from '@shared/utils/filter';

import {knownResourceKindsSelector} from './resourceKindSelectors';
import {createDeepEqualSelector} from './utils';

export const activeResourceStorageSelector = createSelector(
  [(state: RootState) => state.main.clusterConnection, (state: RootState) => state.main.preview],
  (clusterConnection, preview): ResourceStorage => {
    if (clusterConnection) {
      return 'cluster';
    }
    if (preview) {
      return 'preview';
    }
    return 'local';
  }
);

export const createResourceMetaMapSelector = <Storage extends ResourceStorage>(
  storage: Storage
): Selector<RootState, ResourceMetaMap<Storage>> => {
  return createSelector(
    (state: RootState) => state.main.resourceMetaMapByStorage[storage],
    (resourceMetaMap): ResourceMetaMap<Storage> => resourceMetaMap
  );
};

export const localResourceMetaMapSelector = createResourceMetaMapSelector('local');
export const clusterResourceMetaMapSelector = createResourceMetaMapSelector('cluster');
export const previewResourceMetaMapSelector = createResourceMetaMapSelector('preview');
export const transientResourceMetaMapSelector = createResourceMetaMapSelector('transient');

const getResourceMetaMapSelector = <Storage extends ResourceStorage>(
  storage: Storage
): Selector<RootState, ResourceMetaMap<Storage>> => {
  if (storage === 'cluster')
    return clusterResourceMetaMapSelector as Selector<RootState, ResourceMetaMap<typeof storage>>;
  if (storage === 'preview')
    return previewResourceMetaMapSelector as Selector<RootState, ResourceMetaMap<typeof storage>>;
  if (storage === 'transient')
    return transientResourceMetaMapSelector as Selector<RootState, ResourceMetaMap<typeof storage>>;
  if (storage === 'local') return localResourceMetaMapSelector as Selector<RootState, ResourceMetaMap<typeof storage>>;
  throw new Error(`Unknown resource storage: ${storage}`);
};

export const useResourceMetaMap = <Storage extends ResourceStorage>(storage: Storage): ResourceMetaMap<Storage> => {
  return useAppSelector(getResourceMetaMapSelector(storage));
};

export const useResourceMetaMapRef = <Storage extends ResourceStorage>(storage: Storage) => {
  return useRefSelector(getResourceMetaMapSelector(storage));
};

export const useActiveResourceMetaMap = () => {
  const activeResourceStorage = useAppSelector(activeResourceStorageSelector);
  return useAppSelector(getResourceMetaMapSelector(activeResourceStorage));
};

export const useActiveResourceMetaMapRef = () => {
  const activeResourceStorage = useAppSelector(activeResourceStorageSelector);
  return useRefSelector(getResourceMetaMapSelector(activeResourceStorage));
};

export const activeResourceMetaMapSelector = createDeepEqualSelector(
  [activeResourceStorageSelector, (state: RootState) => state.main.resourceMetaMapByStorage],
  (activeStorage, resourceMetaMapByStorage) => resourceMetaMapByStorage[activeStorage]
);

export const createResourceContentMapSelector = <Storage extends ResourceStorage>(
  storage: Storage
): Selector<RootState, ResourceContentMap<Storage>> => {
  return createSelector(
    (state: RootState) => state.main.resourceContentMapByStorage[storage],
    (resourceContentMap): ResourceContentMap<Storage> => resourceContentMap
  );
};

const localResourceContentMapSelector = createResourceContentMapSelector('local');
const clusterResourceContentMapSelector = createResourceContentMapSelector('cluster');
const previewResourceContentMapSelector = createResourceContentMapSelector('preview');
const transientResourceContentMapSelector = createResourceContentMapSelector('transient');

const getResourceContentMapSelector = <Storage extends ResourceStorage>(
  storage: Storage
): Selector<RootState, ResourceContentMap<Storage>> => {
  if (storage === 'cluster')
    return clusterResourceContentMapSelector as Selector<RootState, ResourceContentMap<typeof storage>>;
  if (storage === 'preview')
    return previewResourceContentMapSelector as Selector<RootState, ResourceContentMap<typeof storage>>;
  if (storage === 'transient')
    return transientResourceContentMapSelector as Selector<RootState, ResourceContentMap<typeof storage>>;
  if (storage === 'local')
    return localResourceContentMapSelector as Selector<RootState, ResourceContentMap<typeof storage>>;
  throw new Error(`Unknown resource storage: ${storage}`);
};

export const useResourceContentMap = <Storage extends ResourceStorage>(
  storage: Storage
): ResourceContentMap<Storage> => {
  return useAppSelector(getResourceContentMapSelector(storage));
};

export const useResourceContentMapRef = <Storage extends ResourceStorage>(
  storage: Storage
): React.MutableRefObject<ResourceContentMap<Storage>> => {
  return useRefSelector(getResourceContentMapSelector(storage));
};

export const useActiveResourceContentMap = () => {
  const activeResourceStorage = useAppSelector(activeResourceStorageSelector);
  return useAppSelector(getResourceContentMapSelector(activeResourceStorage));
};

export const useActiveResourceContentMapRef = () => {
  const activeResourceStorage = useAppSelector(activeResourceStorageSelector);
  return useRefSelector(getResourceContentMapSelector(activeResourceStorage));
};

export const activeResourceCountSelector = createSelector(
  [activeResourceStorageSelector, (state: RootState) => state.main.resourceMetaMapByStorage],
  (activeResourceStorage, resourceMetaMapByStorage) =>
    size(resourceMetaMapByStorage[activeResourceStorage]) + size(resourceMetaMapByStorage['transient'])
);

export const transientResourceCountSelector = createSelector(
  (state: RootState) => state.main.resourceMetaMapByStorage.transient,
  transientResourceMetaMap => Object.keys(transientResourceMetaMap).length
);

export const filteredResourceSelector = createDeepEqualSelector(
  [
    (state: RootState) => state.main.resourceFilter,
    activeResourceStorageSelector,
    (state: RootState) => state.main.resourceMetaMapByStorage,
  ],
  (filter, activeResourceStorage, resourceMetaMapByStorage) => {
    const activeResourceMetaMap = {
      ...resourceMetaMapByStorage[activeResourceStorage],
      ...resourceMetaMapByStorage.transient,
    };

    return Object.values(activeResourceMetaMap).filter(resource => isResourcePassingFilter(resource, filter));
  }
);

export const filteredResourceMapSelector = createDeepEqualSelector(filteredResourceSelector, filteredResources =>
  keyBy(filteredResources, 'id')
);

export const unknownResourcesSelector = createDeepEqualSelector(
  [
    activeResourceStorageSelector,
    (state: RootState) => state.main.resourceMetaMapByStorage,
    (state: RootState) => state.main.resourceContentMapByStorage,
  ],
  (activeResourceStorage, resourceMetaMapByStorage, resourceContentMapByStorage): K8sResource[] => {
    const activeResourceMetaMap = resourceMetaMapByStorage[activeResourceStorage];
    const activeResourceContentMap = resourceContentMapByStorage[activeResourceStorage];
    const unknownResources = Object.values(activeResourceMetaMap)
      .filter(
        resource =>
          !isKustomizationResource(resource) &&
          !getResourceKindHandler(resource.kind) &&
          !resource.name.startsWith('Patch:')
      )
      .map(meta => {
        const content = activeResourceContentMap[meta.id];
        if (content) {
          return joinK8sResource(meta, content);
        }
        return undefined;
      })
      .filter(isDefined);
    return unknownResources;
  }
);

export const allResourcesMetaSelector = createDeepEqualSelector(
  [
    (state: RootState) => state.main.resourceMetaMapByStorage.local,
    (state: RootState) => state.main.resourceMetaMapByStorage.cluster,
    (state: RootState) => state.main.resourceMetaMapByStorage.preview,
    (state: RootState) => state.main.resourceMetaMapByStorage.transient,
  ],
  (localMetaMap, clusterMetaMap, previewMetaMap, transientMetaMap) => {
    // TODO: maybe we should have a constant for the ResourceStorageKey type so we could map the values?
    return [
      ...Object.values(localMetaMap),
      ...Object.values(clusterMetaMap),
      ...Object.values(previewMetaMap),
      ...Object.values(transientMetaMap),
    ];
  }
);

export const allResourceKindsSelector = createDeepEqualSelector(
  [knownResourceKindsSelector, allResourcesMetaSelector],
  (knownResourceKinds, allResourceMetas) => {
    return uniq(allResourceMetas.filter(r => knownResourceKinds.includes(r.kind)).map(r => r.kind));
  }
);

export const resourceKindsSelector = createDeepEqualSelector(allResourcesMetaSelector, allResourceMetas =>
  uniq(allResourceMetas.map(r => r.kind))
);

export const allResourceLabelsSelector = createSelector(allResourcesMetaSelector, allResourceMetas => {
  return mapKeyValuesFromNestedObjects(allResourceMetas, resource => resource.labels || {});
});

export const allResourceAnnotationsSelector = createSelector(allResourcesMetaSelector, allResourceMetas => {
  return mapKeyValuesFromNestedObjects(allResourceMetas, resource => resource.annotations || {});
});
