import {createAsyncThunk, createNextState, original} from '@reduxjs/toolkit';

import {isEqual} from 'lodash';
import log from 'loglevel';

import {clearSelectionReducer} from '@redux/reducers/main/selectionReducers';
import {deleteResource, isResourceSelected, removeResourceFromFile} from '@redux/services/resource';

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
  async (resourceIdentifiers: ResourceIdentifier[], thunkAPI: {getState: Function; dispatch: Function}) => {
    const state: RootState = thunkAPI.getState();

    const nextMainState = createNextState(state.main, mainState => {
      let deletedCheckedResourcesIdentifiers: ResourceIdentifier[] = [];

      resourceIdentifiers.forEach(resourceIdentifier => {
        const resourceMeta = mainState.resourceMetaStorage[resourceIdentifier.origin.storage][resourceIdentifier.id];
        if (!resourceMeta) {
          return;
        }

        // TODO: after @monokle/validation is added, we will need to reprocess resources
        // updateReferringRefsOnDelete(resource, mainState.resourceMap);

        if (mainState.checkedResourceIdentifiers.some(identifier => isEqual(identifier, resourceIdentifier))) {
          deletedCheckedResourcesIdentifiers.push(resourceIdentifier);
        }

        if (mainState.selection?.type === 'resource' && isResourceSelected(resourceIdentifier, mainState.selection)) {
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

      mainState.checkedResourceIdentifiers = mainState.checkedResourceIdentifiers.filter(
        id => !deletedCheckedResourcesIdentifiers.find(identifier => isEqual(identifier, id))
      );
    });

    return nextMainState;
  }
);
