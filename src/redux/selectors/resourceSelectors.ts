import {createSelector} from 'reselect';

import {isKustomizationResource} from '@redux/services/kustomize';
import {joinK8sResource} from '@redux/services/resource';

import {
  K8sResource,
  ResourceContent,
  ResourceContentStorage,
  ResourceMeta,
  ResourceMetaStorage,
} from '@shared/models/k8sResource';
import {AnyOrigin, OriginFromStorage} from '@shared/models/origin';
import {RootState} from '@shared/models/rootState';
import {ResourceSelection, isResourceSelection} from '@shared/models/selection';

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
  return {...resourceMeta, ...resourceContent};
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

export const kustomizationsSelector = createSelector(
  [
    (state: RootState) => state.main.resourceMetaStorage.local,
    (state: RootState) => state.main.resourceContentStorage.local,
  ],
  (resourceMetaMap, resourceContentMap) => {
    return Object.values(resourceMetaMap)
      .filter(resource => isKustomizationResource(resource))
      .map(resource => joinK8sResource(resource, resourceContentMap[resource.id]));
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

// export const selectedResourceWithMapSelector = createSelector(
//   (state: RootState) => state,
//   (state): {selectedResource: K8sResource | undefined; resourceMap: ResourceMap | undefined} => {
//     const selectedResource = selectedResourceSelector(state);
//     if (!selectedResource) {
//       return {
//         selectedResource: undefined,
//         resourceMap: undefined,
//       };
//     }
//     const resourceMap = resourceMapSelector(state, selectedResource.origin.storage);
//     return {
//       selectedResource,
//       resourceMap,
//     };
//   }
// );

// export const selectedResourceMetaWithMapSelector = createSelector(
//   (state: RootState) => state,
//   state => {
//     const selectedResourceMeta = selectedResourceMetaSelector(state);
//     if (!selectedResourceMeta) {
//       return {
//         selectedResourceMeta: undefined,
//         resourceMetaMap: undefined,
//       };
//     }
//     const resourceMetaMap = resourceMetaMapSelector(state, selectedResourceMeta.origin.storage);
//     return {
//       selectedResourceMeta,
//       resourceMetaMap,
//     };
//   }
// );
