import {Context} from '@kubernetes/client-node';

import {TypedUseSelectorHook} from 'react-redux';

import {uniq} from 'lodash';
import {createSelector} from 'reselect';

import {selectCurrentKubeConfig} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';

import type {ClusterState} from '@shared/models/clusterState';
import type {RootState} from '@shared/models/rootState';
import {isDefined} from '@shared/utils/filter';

export const useClusterSelector: TypedUseSelectorHook<ClusterState> = selector =>
  useAppSelector(state => selector(state.cluster));

export const selectCurrentContextName = (state: ClusterState): string | undefined => {
  return state.currentConfig?.currentContext;
};

export const selectKubeconfigPaths = (state: RootState): string[] => {
  const configsFromClusterSlice = state.cluster.configPaths;
  const globalConfig = state.config.kubeConfig.path;
  const projectConfig = state.config.projectConfig?.kubeConfig?.path;
  const allConfigs = [...configsFromClusterSlice, globalConfig, projectConfig].filter(isDefined);
  return uniq(allConfigs);
};

export const selectCurrentContextId = createSelector(
  (state: RootState) => selectCurrentContextName(state.cluster),
  (state: RootState) => selectCurrentKubeConfig(state).path,
  (context, kubeconfig) => {
    if (!context) return undefined;
    return {context, kubeconfig};
  }
);

export const selectContext =
  (contextName?: string) =>
  (state: RootState): Context | undefined => {
    contextName = contextName ?? state.currentConfig?.currentContext;
    const context = state.currentConfig?.contexts.find(c => c.name === contextName);
    return context;
  };
