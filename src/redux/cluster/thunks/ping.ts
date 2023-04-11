import {createAsyncThunk} from '@reduxjs/toolkit';

import {MonokleClusterError} from '@shared/ipc';
import {ThunkApi} from '@shared/models/thunk';

import {selectCurrentContextId} from '../selectors';
import {setup} from '../service/kube-control';

type PingArgs = undefined;

type PingResponse = {
  proxyPort: number;
};

type PingFailure = MonokleClusterError;

/**
 * Pings the current context which will
 * - Prepare the proxy
 * - Check for connectivity problems.
 */
export const pingCluster = createAsyncThunk<PingResponse, PingArgs, ThunkApi & {rejectValue: PingFailure}>(
  'cluster/ping',
  async (_, {getState, rejectWithValue}) => {
    // Ping for healthy connection
    const state = getState();
    const contextId = selectCurrentContextId(state);

    if (!contextId) {
      throw new Error('no_cluster_context_found');
    }

    const pingResponse = await setup(contextId);

    if (!pingResponse.success) {
      return rejectWithValue(pingResponse);
    }

    return {proxyPort: pingResponse.port};
  }
);
