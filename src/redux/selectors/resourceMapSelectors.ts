import {useMemo} from 'react';

import {keyBy} from 'lodash';
import {createSelector} from 'reselect';

import {useAppSelector} from '@redux/hooks';
import {isKustomizationResource} from '@redux/services/kustomize';
import {joinK8sResource, joinK8sResourceMap} from '@redux/services/resource';

import {useRefSelector} from '@utils/hooks';
import {mapKeyValuesFromNestedObjects} from '@utils/objects';
import {isResourcePassingFilter} from '@utils/resources';

import {getResourceKindHandler} from '@src/kindhandlers';

import {
  K8sResource,
  ResourceContentMap,
  ResourceMap,
  ResourceMetaMap,
  ResourceStorage,
} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';
import {isDefined} from '@shared/utils/filter';

import {knownResourceKindsSelector} from './resourceKindSelectors';
import {createDeepEqualSelector} from './utils';

// TODO: do the same thing for resource maps as I did for resource selectors
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

export const useResourceMap = <Storage extends ResourceStorage>(storage: Storage): ResourceMap<Storage> => {
  const resourceMapSelector = useMemo(() => createResourceMapSelector(storage), [storage]);
  return useAppSelector(state => resourceMapSelector(state));
};

export const useActiveResourceMap = (): ResourceMap<ResourceStorage> => {
  const activeResourceStorage = useAppSelector(activeResourceStorageSelector);
  const activeResourceMapSelector = useMemo(
    () => createResourceMapSelector(activeResourceStorage),
    [activeResourceStorage]
  );
  return useAppSelector(activeResourceMapSelector);
};

export const useActiveResourceMapRef = (): React.MutableRefObject<ResourceMap<ResourceStorage>> => {
  const activeResourceStorage = useAppSelector(activeResourceStorageSelector);
  const activeResourceMapSelector = useMemo(
    () => createResourceMapSelector(activeResourceStorage),
    [activeResourceStorage]
  );
  return useRefSelector(activeResourceMapSelector);
};

export const createResourceMetaMapSelector = <Storage extends ResourceStorage>(storage: Storage) => {
  return createSelector(
    (state: RootState) => state.main.resourceMetaMapByStorage[storage],
    (resourceMetaMap): ResourceMetaMap<Storage> => resourceMetaMap
  );
};

export const useResourceMetaMap = <Storage extends ResourceStorage>(storage: Storage): ResourceMetaMap<Storage> => {
  const resourceMetaMapSelector = useMemo(() => createResourceMetaMapSelector(storage), [storage]);
  return useAppSelector(resourceMetaMapSelector);
};

export const useResourceMetaMapRef = <Storage extends ResourceStorage>(storage: Storage) => {
  const resourceMetaMapSelector = useMemo(() => createResourceMetaMapSelector(storage), [storage]);
  return useRefSelector(resourceMetaMapSelector);
};

export const useActiveResourceMetaMap = () => {
  const activeResourceStorage = useAppSelector(activeResourceStorageSelector);
  const activeResourceMetaMapSelector = useMemo(
    () => createResourceMetaMapSelector(activeResourceStorage),
    [activeResourceStorage]
  );
  return useAppSelector(activeResourceMetaMapSelector);
};

export const useActiveResourceMetaMapRef = () => {
  const activeResourceStorage = useAppSelector(activeResourceStorageSelector);
  const activeResourceMetaMapSelector = useMemo(
    () => createResourceMetaMapSelector(activeResourceStorage),
    [activeResourceStorage]
  );
  return useRefSelector(activeResourceMetaMapSelector);
};

export const createResourceContentMapSelector = <Storage extends ResourceStorage>(storage: Storage) => {
  return createSelector(
    (state: RootState) => state.main.resourceContentMapByStorage[storage],
    (resourceContentMap): ResourceContentMap<Storage> => resourceContentMap
  );
};

export const useResourceContentMap = <Storage extends ResourceStorage>(
  storage: Storage
): ResourceContentMap<Storage> => {
  const resourceContentMapSelector = useMemo(() => createResourceContentMapSelector(storage), [storage]);
  return useAppSelector(resourceContentMapSelector);
};

export const useResourceContentMapRef = <Storage extends ResourceStorage>(
  storage: Storage
): React.MutableRefObject<ResourceContentMap<Storage>> => {
  const resourceContentMapSelector = useMemo(() => createResourceContentMapSelector(storage), [storage]);
  return useRefSelector(resourceContentMapSelector);
};

export const useActiveResourceContentMap = () => {
  const activeResourceStorage = useAppSelector(activeResourceStorageSelector);
  const activeResourceContentMapSelector = useMemo(
    () => createResourceContentMapSelector(activeResourceStorage),
    [activeResourceStorage]
  );
  return useAppSelector(activeResourceContentMapSelector);
};

export const useActiveResourceContentMapRef = () => {
  const activeResourceStorage = useAppSelector(activeResourceStorageSelector);
  const activeResourceContentMapSelector = useMemo(
    () => createResourceContentMapSelector(activeResourceStorage),
    [activeResourceStorage]
  );
  return useRefSelector(activeResourceContentMapSelector);
};

export const activeResourceStorageSelector = createSelector(
  (state: RootState) => state.main,
  (mainState): ResourceStorage => {
    if (mainState.clusterConnection) {
      return 'cluster';
    }
    if (mainState.preview) {
      return 'preview';
    }
    return 'local';
  }
);

export const activeResourceCountSelector = createSelector(
  [activeResourceStorageSelector, (state: RootState) => state.main.resourceMetaMapByStorage],
  (activeResourceStorage, resourceMetaMapByStorage) =>
    Object.keys(resourceMetaMapByStorage[activeResourceStorage]).length
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
    const activeResourceMetaMap = resourceMetaMapByStorage[activeResourceStorage];
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
    return allResourceMetas.filter(r => !knownResourceKinds.includes(r.kind)).map(r => r.kind);
  }
);

export const allResourceLabelsSelector = createSelector(allResourcesMetaSelector, allResourceMetas => {
  return mapKeyValuesFromNestedObjects(allResourceMetas, resource => resource.labels || {});
});

export const allResourceAnnotationsSelector = createSelector(allResourcesMetaSelector, allResourceMetas => {
  return mapKeyValuesFromNestedObjects(allResourceMetas, resource => resource.annotations || {});
});
