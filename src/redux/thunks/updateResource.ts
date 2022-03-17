import {createAsyncThunk, createNextState, original} from '@reduxjs/toolkit';

import log from 'loglevel';

import {RootState} from '@models/rootstate';

import {
  UpdateResourcePayload,
  getActiveResourceMap,
  getLocalResourceMap,
  performResourceContentUpdate,
} from '@redux/reducers/main';
import {currentConfigSelector} from '@redux/selectors';
import {isKustomizationPatch, isKustomizationResource, processKustomizations} from '@redux/services/kustomize';
import {getK8sVersion} from '@redux/services/projectConfig';
import {reprocessResources} from '@redux/services/resource';
import {findResourcesToReprocess} from '@redux/services/resourceRefs';
import {updateSelectionAndHighlights} from '@redux/services/selection';

export const updateResource = createAsyncThunk(
  'main/updateResource',
  async (payload: UpdateResourcePayload, thunkAPI: {getState: Function; dispatch: Function}) => {
    const state: RootState = thunkAPI.getState();
    const projectConfig = currentConfigSelector(state);
    const schemaVersion = getK8sVersion(projectConfig);
    const userDataDir = String(state.config.userDataDir);

    const {isInClusterMode, resourceId, content, preventSelectionAndHighlightsUpdate} = payload;

    const nextMainState = createNextState(state.main, mainState => {
      try {
        const currentResourceMap = isInClusterMode ? getLocalResourceMap(mainState) : getActiveResourceMap(mainState);
        const resourceMap = mainState.resourceMap;
        const resource = isInClusterMode ? resourceMap[resourceId] : currentResourceMap[resourceId];

        const fileMap = mainState.fileMap;
        if (resource) {
          performResourceContentUpdate(resource, content, fileMap, resourceMap);
          let resourceIds = findResourcesToReprocess(resource, currentResourceMap);
          reprocessResources(
            schemaVersion,
            userDataDir,
            resourceIds,
            currentResourceMap,
            fileMap,
            mainState.resourceRefsProcessingOptions
          );
          if (!preventSelectionAndHighlightsUpdate) {
            resource.isSelected = false;
            updateSelectionAndHighlights(mainState, resource);
          }
        } else {
          const r = resourceMap[resourceId];
          // check if this was a kustomization resource updated during a kustomize preview
          if (
            r &&
            (isKustomizationResource(r) || isKustomizationPatch(r)) &&
            mainState.previewResourceId &&
            isKustomizationResource(resourceMap[mainState.previewResourceId])
          ) {
            performResourceContentUpdate(r, content, fileMap, resourceMap);
            processKustomizations(resourceMap, fileMap);
          } else {
            log.warn('Failed to find updated resource during preview', resourceId);
          }
        }
      } catch (e) {
        log.error(e);
        return original(mainState);
      }
    });

    return nextMainState;
  }
);
