import {joinK8sResource} from '@redux/services/resource';

import {
  K8sResource,
  ResourceContent,
  ResourceIdentifier,
  ResourceMeta,
  ResourceStorage,
} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';

export const getResourceFromState = <Storage extends ResourceStorage>(
  state: RootState,
  resourceIdentifier: ResourceIdentifier<Storage>
): K8sResource<Storage> | undefined => {
  const metaMap = state.main.resourceMetaMapByStorage[resourceIdentifier.storage];
  const contentMap = state.main.resourceContentMapByStorage[resourceIdentifier.storage];
  const meta = metaMap[resourceIdentifier.id];
  const content = contentMap[resourceIdentifier.id];
  if (!meta || !content) {
    return undefined;
  }
  return joinK8sResource(meta, content);
};

export const getResourceMetaFromState = <Storage extends ResourceStorage>(
  state: RootState,
  resourceIdentifier: ResourceIdentifier<Storage>
): ResourceMeta<Storage> | undefined => {
  const metaMap = state.main.resourceMetaMapByStorage[resourceIdentifier.storage];
  return metaMap[resourceIdentifier.id];
};

export const getResourceContentFromState = <Storage extends ResourceStorage>(
  state: RootState,
  resourceIdentifier: ResourceIdentifier<Storage>
): ResourceContent<Storage> | undefined => {
  const contentMap = state.main.resourceContentMapByStorage[resourceIdentifier.storage];
  return contentMap[resourceIdentifier.id];
};
