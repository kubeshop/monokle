import {AppListenerFn} from '@redux/listeners/base';

import {setClusterProxyPort, setKubeConfigPath, setKubeContext} from '../getters';

// More information about why this is needed in the ../getters file
export const clusterArgsChangedListener: AppListenerFn = listen => {
  listen({
    predicate: (_, currentState, originalState) => {
      if (
        currentState.main.clusterConnection?.kubeConfigPath !== originalState.main.clusterConnection?.kubeConfigPath
      ) {
        return true;
      }
      if (currentState.main.clusterConnection?.context !== originalState.main.clusterConnection?.context) {
        return true;
      }
      if (currentState.cluster.proxyPort !== originalState.cluster.proxyPort) {
        return true;
      }
      return false;
    },
    effect: async (_, {getState}) => {
      setKubeConfigPath(getState().main.clusterConnection?.kubeConfigPath);
      setKubeContext(getState().main.clusterConnection?.context);
      setClusterProxyPort(getState().cluster.proxyPort);
    },
  });
};
