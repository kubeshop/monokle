import {createAsyncThunk, original} from '@reduxjs/toolkit';

import log from 'loglevel';

import {PREDEFINED_K8S_VERSION} from '@constants/constants';

import {RootState} from '@models/rootstate';

import {
  UpdateResourcePayload,
  getActiveResourceMap,
  getLocalResourceMap,
  performResourceContentUpdate,
} from '@redux/reducers/main';
import {currentConfigSelector} from '@redux/selectors';
import {isKustomizationPatch, isKustomizationResource, processKustomizations} from '@redux/services/kustomize';
import {reprocessResources} from '@redux/services/resource';
import {findResourcesToReprocess} from '@redux/services/resourceRefs';
import {updateSelectionAndHighlights} from '@redux/services/selection';

export const updateResource = createAsyncThunk(
  'main/updateResource',
  async (payload: UpdateResourcePayload, thunkAPI: {getState: Function; dispatch: Function}) => {
    const state: RootState = thunkAPI.getState();
    const projectConfig = currentConfigSelector(state);
    const schemaVersion = projectConfig.k8sVersion || PREDEFINED_K8S_VERSION;
    const userDataDir = String(state.config.userDataDir);

    try {
      const isInClusterMode = payload.isInClusterMode;
      const currentResourceMap = isInClusterMode ? getLocalResourceMap(state.main) : getActiveResourceMap(state.main);
      const resourceMap = state.main.resourceMap;
      const resource = isInClusterMode ? resourceMap[payload.resourceId] : currentResourceMap[payload.resourceId];

      const fileMap = state.main.fileMap;
      if (resource) {
        performResourceContentUpdate(resource, payload.content, fileMap, resourceMap);
        let resourceIds = findResourcesToReprocess(resource, currentResourceMap);
        reprocessResources(
          schemaVersion,
          userDataDir,
          resourceIds,
          currentResourceMap,
          fileMap,
          state.main.resourceRefsProcessingOptions
        );
        if (!payload.preventSelectionAndHighlightsUpdate) {
          resource.isSelected = false;
          updateSelectionAndHighlights(state.main, resource);
        }
      } else {
        const r = resourceMap[payload.resourceId];
        // check if this was a kustomization resource updated during a kustomize preview
        if (
          r &&
          (isKustomizationResource(r) || isKustomizationPatch(r)) &&
          state.main.previewResourceId &&
          isKustomizationResource(resourceMap[state.main.previewResourceId])
        ) {
          performResourceContentUpdate(r, payload.content, fileMap, resourceMap);
          processKustomizations(resourceMap, fileMap);
        } else {
          log.warn('Failed to find updated resource during preview', payload.resourceId);
        }
      }
    } catch (e) {
      log.error(e);
      return original(state);
    }
  }
);
