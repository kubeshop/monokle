import {Context} from '@kubernetes/client-node';

import {ModernKubeConfig} from '@shared/models/config';
import {RootState} from '@shared/models/rootState';

import {kubeConfigPathSelector} from '../selectors';

export const selectKubeconfig = (
  state: RootState,
  options: {kubeconfig?: string} = {}
): ModernKubeConfig | undefined => {
  const kubeconfigPath = options.kubeconfig ?? kubeConfigPathSelector(state);
  if (!kubeconfigPath) return undefined;
  const kubeconfig = state.cluster.kubeconfigs[kubeconfigPath];
  return kubeconfig;
};

export const selectKubeContext = (
  state: RootState,
  options: {kubeconfig?: string; context?: string} = {}
): Context | undefined => {
  const kubeconfig = selectKubeconfig(state, options);
  if (!kubeconfig?.isValid) return undefined;
  const contextName = options.context ?? kubeconfig.currentContext;
  const context = kubeconfig.contexts.find(c => c.name === contextName);
  return context;
};
