import {size} from 'lodash';
import {createSelector} from 'reselect';

import {RootState} from '../models/rootState';

export const transientResourceCountSelector = createSelector(
  // TODO: could we memoize this for only the count? maybe a new `createCountSelector`?
  (state: RootState) => state.main.resourceMetaMapByStorage.transient,
  transientMetaStorage => {
    return size(transientMetaStorage);
  }
);

export const isInPreviewModeSelector = createSelector(
  (state: RootState) => state.main.preview,
  preview => {
    return Boolean(preview);
  }
);

export const activeProjectSelector = createSelector(
  (state: RootState) => state.config,
  config => config.projects.find(p => p.rootFolder === config.selectedProjectRootFolder)
);

export const kubeConfigPathValidSelector = createSelector(
  (state: RootState) => state.config,
  config => {
    return Boolean(config.projectConfig?.kubeConfig?.isPathValid) || Boolean(config.kubeConfig.isPathValid);
  }
);
