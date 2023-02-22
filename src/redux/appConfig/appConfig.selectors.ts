import {isEmpty} from 'lodash';
import {createSelector} from 'reselect';

import {createDeepEqualSelector} from '@redux/selectors/utils';
import {mergeConfigs, populateProjectConfig} from '@redux/services/projectConfig';

import {ProjectConfig} from '@shared/models/config';
import {RootState} from '@shared/models/rootState';
import {Colors} from '@shared/styles';

export {activeProjectSelector, kubeConfigPathValidSelector} from '@shared/utils/selectors';

export const kubeConfigContextSelector = createSelector(
  [
    (state: RootState) => state.config.projectConfig?.kubeConfig?.currentContext,
    (state: RootState) => state.config.kubeConfig.currentContext,
  ],
  (projectCurrentContext, currentContext) => {
    return projectCurrentContext || currentContext || '';
  }
);

export const kubeConfigContextColorSelector = createSelector(
  [
    (state: RootState) => state.config.projectConfig?.kubeConfig?.currentContext,
    (state: RootState) => state.config.kubeConfig.currentContext,
    (state: RootState) => state.config.kubeConfigContextsColors,
  ],
  (projectContext, currentContext, kubeConfigContextsColors) => {
    if (projectContext) {
      return kubeConfigContextsColors[projectContext] || Colors.volcano8;
    }

    if (currentContext) {
      return kubeConfigContextsColors[currentContext] || Colors.volcano8;
    }

    return Colors.volcano8;
  }
);

export const kubeConfigContextsSelector = createSelector(
  [
    (state: RootState) => state.config.projectConfig?.kubeConfig?.contexts,
    (state: RootState) => state.config.kubeConfig.contexts,
  ],
  (projectContexts = [], contexts = []) => {
    return !isEmpty(projectContexts) ? projectContexts : contexts;
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
  [
    (state: RootState) => state.config.projectConfig?.kubeConfig?.path,
    (state: RootState) => state.config.kubeConfig.path,
  ],
  (projectKubeConfigPath, kubeConfigPath) => projectKubeConfigPath || kubeConfigPath || ''
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
