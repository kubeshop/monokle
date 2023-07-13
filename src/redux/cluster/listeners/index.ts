import {clusterArgsChangedListener} from './clusterArgsChanged';
import {kubeConfigListener, kubeconfigPathUpdateListener} from './kubeconfig';

export const clusterListeners = [kubeConfigListener, kubeconfigPathUpdateListener, clusterArgsChangedListener];
