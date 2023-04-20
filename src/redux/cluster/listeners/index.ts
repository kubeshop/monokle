import {kubeConfigListener, kubeconfigPathUpdateListener} from './kubeconfig';

export const clusterListeners = [kubeConfigListener, kubeconfigPathUpdateListener];
