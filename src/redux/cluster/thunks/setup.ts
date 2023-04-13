import {createAsyncThunk} from '@reduxjs/toolkit';

import {MonokleClusterError} from '@shared/ipc';
import {ThunkApi} from '@shared/models/thunk';

import {selectCurrentContextId} from '../selectors';
import {setup} from '../service/kube-control';

type SetupArgs = undefined;

type SetupResponse = {
  proxyPort: number;
};

type SetupFailure = MonokleClusterError;

/**
 * Prepares the current context which will
 * - Prepare the proxy
 * - Check for connectivity problems.
 */
export const setupCluster = createAsyncThunk<SetupResponse, SetupArgs, ThunkApi & {rejectValue: SetupFailure}>(
  'cluster/setup',
  async (_, {getState, rejectWithValue}) => {
    // Ping for healthy connection
    const state = getState();
    const contextId = selectCurrentContextId(state);

    if (!contextId) {
      throw new Error('no_cluster_context_found');
    }

    const setupResponse = await setup(contextId);

    if (!setupResponse.success) {
      return rejectWithValue(setupResponse);
    }

    return {proxyPort: setupResponse.port};
  }
);
