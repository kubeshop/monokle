import {isBoolean} from 'lodash';
import {createSelector} from 'reselect';

import {RootState} from '../models/rootState';

export const activeProjectSelector = createSelector(
  (state: RootState) => state.config,
  config => config.projects.find(p => p.rootFolder === config.selectedProjectRootFolder)
);

// TODO: rename this after finishing refactoring all places where the old `isInPreviewModeSelector` is used
// the previous selector returned `true` even if you were in ClusterMode but that's no longer desired
export const isInPreviewModeSelectorNew = createSelector(
  (state: RootState) => state,
  state => {
    return Boolean(state.main.preview);
  }
);

export const kubeConfigContextSelector = createSelector(
  (state: RootState) => state.config,
  config => {
    if (config.kubeConfig.currentContext) {
      return config.kubeConfig.currentContext;
    }

    return '';
  }
);

export const kubeConfigPathValidSelector = createSelector(
  (state: RootState) => state.config,
  config => {
    if (isBoolean(config.projectConfig?.kubeConfig?.isPathValid)) {
      return Boolean(config.projectConfig?.kubeConfig?.isPathValid);
    }
    if (isBoolean(config.kubeConfig.isPathValid)) {
      return Boolean(config.kubeConfig.isPathValid);
    }
    return false;
  }
);
