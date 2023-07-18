import {Context} from '@kubernetes/client-node';

import {TypedUseSelectorHook} from 'react-redux';

import {uniq} from 'lodash';
import {createSelector} from 'reselect';

import {useAppSelector} from '@redux/hooks';

import type {ClusterState} from '@shared/models/clusterState';
import {ModernKubeConfig} from '@shared/models/config';
import type {RootState} from '@shared/models/rootState';
import {selectKubeconfig} from '@shared/utils/cluster/selectors';
import {isDefined} from '@shared/utils/filter';

export const useClusterSelector: TypedUseSelectorHook<ClusterState> = selector =>
  useAppSelector(state => selector(state.cluster));

export function getContext(kubeconfig: ModernKubeConfig | undefined, context?: string): Context | undefined {
  if (!kubeconfig?.isValid) return undefined;
  const contextName = context ?? kubeconfig.currentContext;
  return kubeconfig.contexts.find(c => c.name === contextName);
}

export const selectKubeconfigPaths = (state: RootState): string[] => {
  const configsFromClusterSlice = state.cluster.configPaths;
  const globalConfig = state.config.kubeConfig.path;
  const projectConfig = state.config.projectConfig?.kubeConfig?.path;
  let allConfigs = [...configsFromClusterSlice, globalConfig, projectConfig].filter(isDefined);
  allConfigs = uniq(
    allConfigs
      .map(config => {
        // KUBECONFIG ENV VAR can contain multiple paths separated by ':'
        if (config.includes(':')) {
          return config.split(':');
        }
        return config;
      })
      .flat()
  );
  return allConfigs;
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
