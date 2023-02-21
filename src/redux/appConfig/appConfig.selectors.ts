import {createSelector} from 'reselect';

import {createDeepEqualSelector} from '@redux/selectors/utils';
import {mergeConfigs, populateProjectConfig} from '@redux/services/projectConfig';

import {ProjectConfig} from '@shared/models/config';
import {RootState} from '@shared/models/rootState';
import {Colors} from '@shared/styles';

export {activeProjectSelector, kubeConfigPathValidSelector} from '@shared/utils/selectors';

export const kubeConfigContextSelector = createSelector(
  (state: RootState) => state.config,
  config => {
    if (config.kubeConfig.currentContext) {
      return config.kubeConfig.currentContext;
    }

    return '';
  }
);

export const kubeConfigContextColorSelector = createSelector(
  [
    (state: RootState) => state.config.kubeConfig.currentContext,
    (state: RootState) => state.config.kubeConfigContextsColors,
  ],
  (currentContext, kubeConfigContextsColors) => {
    if (!currentContext) {
      return Colors.volcano8;
    }

    return kubeConfigContextsColors[currentContext] || Colors.volcano8;
  }
);

export const kubeConfigContextsSelector = createSelector(
  (state: RootState) => state.config.kubeConfig.contexts,
  contexts => {
    if (contexts) {
      return contexts;
    }
    return [];
  }
);

export const currentKubeContextSelector = createSelector(
  (state: RootState) => state.config.kubeConfig.currentContext,
  context => context
);

export const currentClusterAccessSelector = createSelector(
  [currentKubeContextSelector, (state: RootState) => state.config.clusterAccess],
  (currentContext, clusterAccess) => {
    if (!currentContext) {
      return [];
    }
    return clusterAccess?.filter(ca => ca.context === currentContext) || [];
  }
);

export const kubeConfigPathSelector = createSelector(
  (state: RootState) => state.config.kubeConfig.path,
  kubeConfigPath => {
    if (kubeConfigPath) {
      return kubeConfigPath;
    }
    return '';
  }
);

export const currentConfigSelector = createDeepEqualSelector(
  (state: RootState) => state.config,
  config => {
    const applicationConfig: ProjectConfig = populateProjectConfig(config);
    const projectConfig: ProjectConfig | null | undefined = config.projectConfig;
    return mergeConfigs(applicationConfig, projectConfig);
  }
);

export const settingsSelector = createDeepEqualSelector(currentConfigSelector, currentConfig => {
  return currentConfig.settings || {};
});

export const scanExcludesSelector = createDeepEqualSelector(currentConfigSelector, currentConfig => {
  return currentConfig.scanExcludes || [];
});

export const fileIncludesSelector = createDeepEqualSelector(currentConfigSelector, currentConfig => {
  currentConfig.fileIncludes || [];
});
