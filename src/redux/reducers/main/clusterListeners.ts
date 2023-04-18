import {isAnyOf} from '@reduxjs/toolkit';

import {kubeConfigContextSelector, updateUsingKubectlProxy} from '@redux/appConfig';
import {AppListenerFn} from '@redux/listeners/base';
import {loadClusterResources, startClusterConnection} from '@redux/thunks/cluster';

export const retryClusterConnectionListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(loadClusterResources.rejected),
    effect: async (_, {dispatch, getState, delay}) => {
      const kubeConfigContext = kubeConfigContextSelector(getState());
      const useKubectlProxy = getState().config.useKubectlProxy;

      if (useKubectlProxy) {
        return;
      }

      await delay(10);

      dispatch(updateUsingKubectlProxy(true));
      dispatch(startClusterConnection({context: kubeConfigContext}));
    },
  });
};
