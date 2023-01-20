import {createAsyncThunk, createNextState, original} from '@reduxjs/toolkit';

import log from 'loglevel';

import {clearSelectionReducer} from '@redux/reducers/main/selectionReducers';
import {deleteResource, removeResourceFromFile} from '@redux/services/resource';

import {getResourceKindHandler} from '@src/kindhandlers';

import {
  ResourceIdentifier,
  isClusterResourceMeta,
  isLocalResourceMeta,
  isTransientResourceMeta,
} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';
import {createKubeClient} from '@shared/utils/kubeclient';

export const removeResources = createAsyncThunk(
  'main/removeResources',
  async (resourceIds: ResourceIdentifier[], thunkAPI: {getState: Function; dispatch: Function}) => {
    const state: RootState = thunkAPI.getState();

    const nextMainState = createNextState(state.main, mainState => {
      let deletedCheckedResourcesIds: string[] = [];

      resourceIds.forEach(resourceId => {
        const resourceMeta = mainState.resourceMetaStorage[resourceId.origin.storage][resourceId.id];
        if (!resourceMeta) {
          return;
        }

        // TODO: after @monokle/validation is added, we will need to reprocess resources
        // updateReferringRefsOnDelete(resource, mainState.resourceMap);

        if (mainState.checkedResourceIds.includes(resourceId.id)) {
          deletedCheckedResourcesIds.push(resourceId.id);
        }

        if (mainState.selection?.type === 'resource' && mainState.selection.resourceId === resourceId.id) {
          clearSelectionReducer(mainState);
        }

        if (isTransientResourceMeta(resourceMeta)) {
          deleteResource(resourceMeta, {
            resourceMetaMap: mainState.resourceMetaStorage.transient,
            resourceContentMap: mainState.resourceContentStorage.transient,
          });
          return;
        }

        if (isLocalResourceMeta(resourceMeta)) {
          removeResourceFromFile(resourceMeta, mainState.fileMap, {
            resourceMetaMap: mainState.resourceMetaStorage.local,
            resourceContentMap: mainState.resourceContentStorage.local,
          });
          return;
        }

        if (mainState.clusterConnection && isClusterResourceMeta(resourceMeta)) {
          try {
            const kubeClient = createKubeClient(
              mainState.clusterConnection.kubeConfigPath,
              mainState.clusterConnection.context
            );

            const kindHandler = getResourceKindHandler(resourceMeta.kind);
            if (kindHandler?.deleteResourceInCluster) {
              kindHandler.deleteResourceInCluster(kubeClient, resourceMeta);
              deleteResource(resourceMeta, {
                resourceMetaMap: mainState.resourceMetaStorage.cluster,
                resourceContentMap: mainState.resourceContentStorage.cluster,
              });
            }
          } catch (err) {
            log.error(err);
            return original(mainState);
          }
        }
      });

      mainState.checkedResourceIds = mainState.checkedResourceIds.filter(
        id => !deletedCheckedResourcesIds.includes(id)
      );
    });

    return nextMainState;
  }
);
