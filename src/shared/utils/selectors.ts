import {isBoolean} from 'lodash';
import {createSelector} from 'reselect';

import {RootState} from '../models/rootState';

export const activeProjectSelector = createSelector(
  (state: RootState) => state.config,
  config => config.projects.find(p => p.rootFolder === config.selectedProjectRootFolder)
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
