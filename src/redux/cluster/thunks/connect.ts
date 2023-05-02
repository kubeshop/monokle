import {createAsyncThunk} from '@reduxjs/toolkit';

import {loadClusterResources, reloadClusterResources} from '@redux/thunks/cluster';

import {ThunkApi} from '@shared/models/thunk';
import {selectKubeContext} from '@shared/utils/cluster/selectors';

import {selectCurrentContextId} from '../selectors';
import {setup} from '../service/kube-control';
import {setupCluster} from './setup';

type ConnectArgs = {
  kubeconfig?: string;
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
  async (payload, {getState, dispatch, rejectWithValue}) => {
    const lastNamespaceLoaded = getState().main.clusterConnectionOptions?.lastNamespaceLoaded;

    // Ping for healthy connection
    await dispatch(setupCluster());
    const contextId = selectCurrentContextId(getState());

    if (!contextId) {
      throw new Error('no_cluster_context_found');
    }

    const setupResponse = await setup(contextId);

    if (!setupResponse.success) {
      return rejectWithValue(setupResponse);
    }

    // Create connection as before
    // Connection will listen to resource updates
    const context = selectKubeContext(getState());
    if (!context) {
      throw new Error('no_cluster_context_found');
    }

    if (payload.reload) {
      await dispatch(
        reloadClusterResources({
          context: context.name,
          namespace: payload.namespace ?? context.namespace ?? lastNamespaceLoaded ?? 'default',
          port: setupResponse.port,
        })
      );
    } else {
      await dispatch(
        loadClusterResources({
          context: context.name,
          namespace: payload.namespace ?? context.namespace ?? lastNamespaceLoaded ?? 'default',
          port: setupResponse.port,
        })
      );
    }

    return {proxyPort: setupResponse.port};
  }
);
