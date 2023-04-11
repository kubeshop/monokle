import {createAsyncThunk} from '@reduxjs/toolkit';

import {kubeConfigPathSelector} from '@redux/appConfig';
import {loadClusterResources, reloadClusterResources} from '@redux/thunks/cluster';

import {ThunkApi} from '@shared/models/thunk';

import {selectContext} from '../selectors';
import {setup} from '../service/kube-control';
import {pingCluster} from './ping';

type ConnectArgs = {
  context?: string;
  namespace?: string;
  reload?: boolean;
};

type ConnectResponse = {
  proxyPort: number;
};

/**
 * Connects to a cluster and loads resources.
 */
export const connectCluster = createAsyncThunk<ConnectResponse, ConnectArgs, ThunkApi>(
  'cluster/connect',
  async (payload, {getState, dispatch}) => {
    // Ping for healthy connection
    await dispatch(pingCluster());
    const state = getState().cluster;
    const context = selectContext(payload.context)(state);
    const kubeconfig = kubeConfigPathSelector(getState());

    if (!context) {
      throw new Error('no_cluster_context_found');
    }

    const pingResponse = await setup({context: context.name, kubeconfig});

    if (!pingResponse.success) {
      throw new Error(pingResponse.code);
    }

    // Create connection as before
    // Connection will listen to resource updates
    if (payload.reload) {
      await dispatch(
        reloadClusterResources({
          context: context.name,
          namespace: context.namespace ?? 'default',
          port: pingResponse.port,
        })
      );
    } else {
      await dispatch(
        loadClusterResources({
          context: context.name,
          namespace: context.namespace ?? 'default',
          port: pingResponse.port,
        })
      );
    }

    return {proxyPort: pingResponse.port};
  }
);
