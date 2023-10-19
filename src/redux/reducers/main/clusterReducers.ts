import {Draft} from '@reduxjs/toolkit';

import {connectCluster} from '@redux/cluster/thunks/connect';
import {disconnectFromCluster} from '@redux/services/clusterResourceWatcher';
import {splitK8sResourceMap} from '@redux/services/resource';
import {resetSelectionHistory} from '@redux/services/selectionHistory';
import {loadClusterResources, reloadClusterResources, stopClusterConnection} from '@redux/thunks/cluster';

import {AppState} from '@shared/models/appState';
import {electronStore} from '@shared/utils';
import {createSliceExtraReducers} from '@shared/utils/redux';

import {clearPreviewReducer} from './previewReducers';
import {clearSelectionReducer} from './selectionReducers';

export const stopClusterConnectionReducer = (state: Draft<AppState>) => {
  resetSelectionHistory(state);
  clearSelectionReducer(state);
  state.clusterConnectionOptions.isLoading = false;
  state.clusterConnection = undefined;
};

export const clusterExtraReducers = createSliceExtraReducers('main', builder => {
  builder.addCase(connectCluster.rejected, state => {
    state.clusterConnectionOptions.isLoading = false;
  });
  builder.addCase(connectCluster.pending, state => {
    state.clusterConnectionOptions.isLoading = true;
  });
  builder.addCase(connectCluster.fulfilled, state => {
    state.clusterConnectionOptions.isLoading = false;
  });

  builder
    .addCase(loadClusterResources.pending, state => {
      // TODO: should we set the context of the cluster connection here?
      state.clusterConnectionOptions.isLoading = true;
    })
    .addCase(loadClusterResources.fulfilled, (state, action) => {
      clearPreviewReducer(state);

      state.clusterConnectionOptions.isLoading = false;
      resetSelectionHistory(state);
      clearSelectionReducer(state);
      state.checkedResourceIdentifiers = [];

      const {metaMap, contentMap} = splitK8sResourceMap(action.payload.resources);

      state.resourceMetaMapByStorage.cluster = metaMap;
      state.resourceContentMapByStorage.cluster = contentMap;
      state.clusterConnection = {
        context: action.payload.context,
        namespace: action.payload.namespace,
        kubeConfigPath: action.payload.kubeConfigPath,
      };
      state.clusterConnectionOptions.lastNamespaceLoaded = action.payload.namespace;
      electronStore.set('appConfig.lastNamespaceLoaded', action.payload.namespace);
    })
    .addCase(loadClusterResources.rejected, state => {
      state.clusterConnectionOptions.isLoading = false;
      state.clusterConnection = undefined;
    });

  builder
    .addCase(reloadClusterResources.pending, state => {
      state.clusterConnectionOptions.isLoading = true;
      disconnectFromCluster();
    })
    .addCase(reloadClusterResources.fulfilled, (state, action) => {
      state.clusterConnectionOptions.isLoading = false;
      state.checkedResourceIdentifiers = [];

      if (
        state.selection?.type === 'resource' &&
        state.selection.resourceIdentifier.storage === 'cluster' &&
        !state.resourceMetaMapByStorage.cluster[state.selection.resourceIdentifier.id]
      ) {
        clearSelectionReducer(state);
      }

      const {metaMap, contentMap} = splitK8sResourceMap(action.payload.resources);

      state.resourceMetaMapByStorage.cluster = metaMap;
      state.resourceContentMapByStorage.cluster = contentMap;
      state.clusterConnection = {
        context: action.payload.context,
        namespace: action.payload.namespace,
        kubeConfigPath: action.payload.kubeConfigPath,
      };
      state.clusterConnectionOptions.lastNamespaceLoaded = action.payload.namespace;
      electronStore.set('appConfig.lastNamespaceLoaded', action.payload.namespace);
    })
    .addCase(reloadClusterResources.rejected, state => {
      state.clusterConnectionOptions.isLoading = false;
      state.clusterConnection = undefined;
    });

  builder.addCase(stopClusterConnection.fulfilled, state => {
    stopClusterConnectionReducer(state);
  });
});
