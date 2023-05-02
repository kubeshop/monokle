import {createSelector} from '@reduxjs/toolkit';

import {has} from 'lodash';

import {createDeepEqualSelector} from '@redux/selectors/utils';
import {mergeConfigs, populateProjectConfig} from '@redux/services/projectConfig';

import {HelmPreviewConfiguration, ProjectConfig} from '@shared/models/config';
import {RootState} from '@shared/models/rootState';
import {Colors} from '@shared/styles';
import {selectKubeconfig} from '@shared/utils/cluster/selectors';

export {activeProjectSelector, kubeConfigPathValidSelector} from '@shared/utils/selectors';

export const kubeConfigContextSelector = createSelector(
  (state: RootState) => selectKubeconfig(state),
  kubeconfig => {
    return kubeconfig?.isValid ? kubeconfig.currentContext : '';
  }
);

export const kubeConfigContextColorSelector = createSelector(
  [(state: RootState) => kubeConfigContextSelector(state), (state: RootState) => state.config.kubeConfigContextsColors],
  (context, kubeConfigContextsColors) => {
    if (context) {
      return kubeConfigContextsColors[context] || Colors.volcano8;
    }

    return Colors.volcano8;
  }
);

export const kubeConfigContextsSelector = createSelector(
  (state: RootState) => selectKubeconfig(state),
  kubeconfig => {
    return kubeconfig?.isValid ? kubeconfig.contexts : [];
  }
);

export const currentKubeContextSelector = createSelector(
  (state: RootState) => selectKubeconfig(state),
  kubeconfig => (kubeconfig?.isValid ? kubeconfig.currentContext : undefined)
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
  (projectKubeConfigPath, kubeConfigPath) => projectKubeConfigPath ?? kubeConfigPath ?? undefined
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

export const selectHelmConfig = (state: RootState, id?: string): HelmPreviewConfiguration | undefined => {
  if (!id) return undefined;
  return state.config.projectConfig?.helm?.previewConfigurationMap?.[id] ?? undefined;
};

export const selectCurrentKubeConfig = createSelector(
  [(state: RootState) => state.config.projectConfig?.kubeConfig, (state: RootState) => state.config.kubeConfig],
  (projectKubeConfig, kubeConfig) => projectKubeConfig || kubeConfig
);

export const isProjectKubeConfigSelector = createSelector(
  (state: RootState) => state.config.projectConfig?.kubeConfig,
  kubeConfig => has(kubeConfig, 'isPathValid') && Boolean(kubeConfig?.isPathValid)
);
