import {createAsyncThunk, createNextState, original} from '@reduxjs/toolkit';

import log from 'loglevel';

import {createKubeClientWithSetup} from '@redux/cluster/service/kube-client';
import {clearSelectionReducer} from '@redux/reducers/main/selectionReducers';
import {deleteResource, isResourceSelected, removeResourceFromFile} from '@redux/services/resource';

import {getResourceKindHandler} from '@src/kindhandlers';

import {AppState} from '@shared/models/appState';
import {ResourceIdentifier, isClusterResourceMeta, isLocalResourceMeta} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';
import {isEqual} from '@shared/utils/isEqual';

export const removeResources = createAsyncThunk<
  {nextMainState: AppState; affectedResourceIdentifiers?: ResourceIdentifier[]},
  ResourceIdentifier[]
>('main/removeResources', async (resourceIdentifiers, thunkAPI: {getState: Function; dispatch: Function}) => {
  const state: RootState = thunkAPI.getState();

  const nextMainState = await createNextState(state.main, async mainState => {
    let deletedCheckedResourcesIdentifiers: ResourceIdentifier[] = [];

    for (const resourceIdentifier of resourceIdentifiers) {
      const resourceMeta = mainState.resourceMetaMapByStorage[resourceIdentifier.storage][resourceIdentifier.id];
      if (!resourceMeta) {
        return original(mainState);
      }

      if (mainState.checkedResourceIdentifiers.some(identifier => isEqual(identifier, resourceIdentifier))) {
        deletedCheckedResourcesIdentifiers.push(resourceIdentifier);
      }

      if (mainState.selection?.type === 'resource' && isResourceSelected(resourceIdentifier, mainState.selection)) {
        clearSelectionReducer(mainState);
      }

      if (resourceMeta.storage === 'transient') {
        deleteResource(resourceMeta, {
          resourceMetaMap: mainState.resourceMetaMapByStorage.transient,
          resourceContentMap: mainState.resourceContentMapByStorage.transient,
        });
        return mainState;
      }

      if (isLocalResourceMeta(resourceMeta)) {
        removeResourceFromFile(resourceMeta, mainState.fileMap, {
          resourceMetaMap: mainState.resourceMetaMapByStorage.local,
          resourceContentMap: mainState.resourceContentMapByStorage.local,
        });
        return mainState;
      }

      if (mainState.clusterConnection && isClusterResourceMeta(resourceMeta)) {
        try {
          const kubeconfig = mainState.clusterConnection.kubeConfigPath;
          const context = mainState.clusterConnection.context;
          const kubeClient = await createKubeClientWithSetup({
            context,
            kubeconfig,
            skipHealthCheck: true,
          });

          const kindHandler = getResourceKindHandler(resourceMeta.kind);
          if (kindHandler?.deleteResourceInCluster) {
            kindHandler.deleteResourceInCluster(kubeClient, resourceMeta);
            deleteResource(resourceMeta, {
              resourceMetaMap: mainState.resourceMetaMapByStorage.cluster,
              resourceContentMap: mainState.resourceContentMapByStorage.cluster,
            });
          }
        } catch (err) {
          log.error(err);
          return original(mainState);
        }
      }
    }

    mainState.checkedResourceIdentifiers = mainState.checkedResourceIdentifiers.filter(
      id => !deletedCheckedResourcesIdentifiers.find(identifier => isEqual(identifier, id))
    );
  });

  return {nextMainState, affectedResourceIdentifiers: resourceIdentifiers};
});
