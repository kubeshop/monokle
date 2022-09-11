import {createAsyncThunk, createNextState} from '@reduxjs/toolkit';

import log from 'loglevel';

import {AppState} from '@models/appstate';
import {RootState} from '@models/rootstate';
import {ThunkApi} from '@models/thunk';

import {setChangedFiles} from '@redux/git';
import {getActiveResourceMap, getLocalResourceMap, performResourceContentUpdate} from '@redux/reducers/main';
import {currentConfigSelector} from '@redux/selectors';
import {isKustomizationPatch, isKustomizationResource, processKustomizations} from '@redux/services/kustomize';
import {getLineChanged} from '@redux/services/manifest-utils';
import {getK8sVersion} from '@redux/services/projectConfig';
import {reprocessResources} from '@redux/services/resource';
import {findResourcesToReprocess} from '@redux/services/resourceRefs';
import {updateSelectionAndHighlights} from '@redux/services/selection';

import {promiseFromIpcRenderer} from '@utils/promises';

type UpdateResourcePayload = {
  resourceId: string;
  text: string;
  preventSelectionAndHighlightsUpdate?: boolean;
  isInClusterMode?: boolean;
  isUpdateFromForm?: boolean;
};

export const updateResource = createAsyncThunk<AppState, UpdateResourcePayload, ThunkApi>(
  'main/updateResource',
  async (payload, thunkAPI) => {
    const state: RootState = thunkAPI.getState();
    const projectConfig = currentConfigSelector(state);
    const schemaVersion = getK8sVersion(projectConfig);
    const userDataDir = String(state.config.userDataDir);
    const policyPlugins = state.main.policies.plugins;
    const projectRootFolderPath = state.config.selectedProjectRootFolder;

    const {isInClusterMode, resourceId, text, preventSelectionAndHighlightsUpdate, isUpdateFromForm} = payload;

    let error: any;

    const nextMainState = createNextState(state.main, mainState => {
      try {
        const currentResourceMap = isInClusterMode ? getLocalResourceMap(mainState) : getActiveResourceMap(mainState);
        const resourceMap = mainState.resourceMap;
        const resource = isInClusterMode ? resourceMap[resourceId] : currentResourceMap[resourceId];

        const fileMap = mainState.fileMap;
        if (resource) {
          const prevContent = resource.text;
          const newContent = text;
          if (isUpdateFromForm) {
            const lineChanged = getLineChanged(prevContent, newContent);
            mainState.lastChangedLine = lineChanged;
          }

          performResourceContentUpdate(resource, text, fileMap, resourceMap);
          let resourceIds = findResourcesToReprocess(resource, currentResourceMap);
          reprocessResources(
            schemaVersion,
            userDataDir,
            resourceIds,
            currentResourceMap,
            fileMap,
            mainState.resourceRefsProcessingOptions,
            {policyPlugins}
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
            performResourceContentUpdate(r, text, fileMap, resourceMap);
            processKustomizations(resourceMap, fileMap);
          } else {
            log.warn('Failed to find updated resource during preview', resourceId);
          }
        }

        if (state.main.autosaving.status) {
          mainState.autosaving.status = false;
        }
      } catch (e: any) {
        const {message, stack} = e || {};
        error = {message, stack};
        log.error(e);
      }
    });

    if (error) {
      return {...state.main, autosaving: {status: false, error}};
    }

    promiseFromIpcRenderer('git.getChangedFiles', 'git.getChangedFiles.result', {
      localPath: projectRootFolderPath,
      fileMap: nextMainState.fileMap,
    }).then(result => {
      thunkAPI.dispatch(setChangedFiles(result));
    });

    return nextMainState;
  }
);
