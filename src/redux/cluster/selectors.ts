import {Context} from '@kubernetes/client-node';

import {TypedUseSelectorHook} from 'react-redux';

import {uniq} from 'lodash';
import {createSelector} from 'reselect';

import {kubeConfigPathSelector} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';

import type {ClusterState} from '@shared/models/clusterState';
import {ModernKubeConfig} from '@shared/models/config';
import type {RootState} from '@shared/models/rootState';
import {isDefined} from '@shared/utils/filter';

export const useClusterSelector: TypedUseSelectorHook<ClusterState> = selector =>
  useAppSelector(state => selector(state.cluster));

export const selectKubeconfig = (
  state: RootState,
  options: {kubeconfig?: string} = {}
): ModernKubeConfig | undefined => {
  const kubeconfigPath = options.kubeconfig ?? kubeConfigPathSelector(state);
  if (!kubeconfigPath) return undefined;
  const kubeconfig = state.cluster.kubeconfigs[kubeconfigPath];
  return kubeconfig;
};

export const selectContext = (
  state: RootState,
  options: {kubeconfig?: string; context?: string} = {}
): Context | undefined => {
  const kubeconfig = selectKubeconfig(state, options);
  if (!kubeconfig?.isValid) return undefined;
  const contextName = options.context ?? kubeconfig.currentContext;
  const context = kubeconfig.contexts.find(c => c.name === contextName);
  return context;
};

export const selectKubeconfigPaths = (state: RootState): string[] => {
  const configsFromClusterSlice = state.cluster.configPaths;
  const globalConfig = state.config.kubeConfig.path;
  const projectConfig = state.config.projectConfig?.kubeConfig?.path;
  const allConfigs = [...configsFromClusterSlice, globalConfig, projectConfig].filter(isDefined);
  return uniq(allConfigs);
};

export const selectCurrentContextId = createSelector(
  (state: RootState) => selectKubeconfig(state),
  kubeconfig => {
    if (!kubeconfig?.isValid) return undefined;
    return {
      kubeconfig: kubeconfig.path,
      context: kubeconfig.currentContext,
    };
  }
);
