import {joinK8sResourceMap} from '@redux/services/resource';

import {ResourceContentMap, ResourceMap, ResourceMetaMap, ResourceStorage} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';

import {activeResourceStorageSelector} from './resourceMapSelectors';

export const getResourceMapFromState = <Storage extends ResourceStorage>(
  state: RootState,
  storage: Storage
): ResourceMap<Storage> => {
  return joinK8sResourceMap(
    state.main.resourceMetaMapByStorage[storage],
    state.main.resourceContentMapByStorage[storage]
  );
};

export const getResourceMetaMapFromState = <Storage extends ResourceStorage>(
  state: RootState,
  storage: Storage
): ResourceMetaMap<Storage> => {
  return state.main.resourceMetaMapByStorage[storage];
};

export const getResourceContentMapFromState = <Storage extends ResourceStorage>(
  state: RootState,
  storage: Storage
): ResourceContentMap<Storage> => {
  return state.main.resourceContentMapByStorage[storage];
};

export const getActiveResourceMapFromState = (state: RootState): ResourceMap => {
  const activeResourceStorage = activeResourceStorageSelector(state);
  return getResourceMapFromState(state, activeResourceStorage);
};

export const getActiveResourceMetaMapFromState = (state: RootState): ResourceMetaMap => {
  const activeResourceStorage = activeResourceStorageSelector(state);
  return getResourceMetaMapFromState(state, activeResourceStorage);
};

export const getActiveResourceContentMapFromState = (state: RootState): ResourceContentMap => {
  const activeResourceStorage = activeResourceStorageSelector(state);
  return getResourceContentMapFromState(state, activeResourceStorage);
};
