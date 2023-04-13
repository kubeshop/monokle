import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import type {ClusterState} from '@shared/models/clusterState';
import {ModernKubeConfig} from '@shared/models/config';

import {startWatchingKubeconfig, stopWatchingKubeconfig} from './listeners/kubeconfig';
import {setupCluster} from './thunks/setup';

const initialState: ClusterState = {
  watching: false,
  proxyError: undefined,
  proxyPort: undefined,
  configPaths: [],
  kubeconfigs: {},
};

export const clusterSlice = createSlice({
  name: 'cluster',
  initialState,
  reducers: {
    // Currently this is only used to debug the actively watched kubeconfigs.
    kubeconfigPathsUpdated(state, action: PayloadAction<{kubeconfigs: string[]}>) {
      state.configPaths = action.payload.kubeconfigs;
    },
    kubeconfigUpdated(state, action: PayloadAction<{config: ModernKubeConfig | undefined}>) {
      const config = action.payload.config;
      if (config) {
        state.kubeconfigs[config.path] = config;
      }
    },
  },
  extraReducers(builder) {
    builder.addCase(setupCluster.rejected, (state, action) => {
      state.proxyError = action.payload;
      state.proxyPort = undefined;
    });
    builder.addCase(setupCluster.fulfilled, (state, action) => {
      state.proxyError = undefined;
      state.proxyPort = action.payload.proxyPort;
    });
    builder.addCase(startWatchingKubeconfig, state => {
      state.watching = true;
    });
    builder.addCase(stopWatchingKubeconfig, state => {
      state.watching = false;
    });
  },
});

export const {kubeconfigPathsUpdated, kubeconfigUpdated} = clusterSlice.actions;
