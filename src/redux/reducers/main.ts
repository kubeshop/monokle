import log from 'loglevel';
import {createAsyncThunk, createSlice, Draft, original, PayloadAction} from '@reduxjs/toolkit';
import path from 'path';
import {PREVIEW_PREFIX, ROOT_FILE_ENTRY} from '@constants/constants';
import {AppConfig} from '@models/appconfig';
import {
  AppState,
  FileMapType,
  HelmChartMapType,
  HelmValuesMapType,
  ResourceFilterType,
  ResourceMapType,
} from '@models/appstate';
import {parseDocument} from 'yaml';
import * as k8s from '@kubernetes/client-node';
import fs from 'fs';
import {previewKustomization} from '@redux/thunks/previewKustomization';
import {previewCluster, repreviewCluster} from '@redux/thunks/previewCluster';
import {setRootFolder} from '@redux/thunks/setRootFolder';
import {performResourceDiff} from '@redux/thunks/diffResource';
import {previewHelmValuesFile} from '@redux/thunks/previewHelmValuesFile';
import {selectFromHistory} from '@redux/thunks/selectionHistory';
import {saveUnsavedResource} from '@redux/thunks/saveUnsavedResource';
import {resetSelectionHistory} from '@redux/services/selectionHistory';
import {K8sResource} from '@models/k8sresource';
import {AlertType} from '@models/alert';
import {getResourceKindHandler} from '@src/kindhandlers';
import {getFileStats} from '@utils/files';
import electronStore from '@utils/electronStore';
import {parallelLimit} from 'async';

import initialState from '../initialState';
import {clearResourceSelections, highlightChildrenResources, updateSelectionAndHighlights} from '../services/selection';
import {
  removePath,
  getAllFileEntriesForPath,
  getFileEntryForAbsolutePath,
  getResourcesForPath,
  reloadFile,
  createFileEntry,
  addPath,
  addFolder,
} from '../services/fileEntry';
import {
  extractK8sResources,
  isFileResource,
  isUnsavedResource,
  recalculateResourceRanges,
  removeResourceFromFile,
  reprocessResources,
  saveResource,
} from '../services/resource';

export type SetRootFolderPayload = {
  appConfig: AppConfig;
  fileMap: FileMapType;
  resourceMap: ResourceMapType;
  helmChartMap: HelmChartMapType;
  helmValuesMap: HelmValuesMapType;
  alert?: AlertType;
};

export type UpdateResourcePayload = {
  resourceId: string;
  content: string;
  preventSelectionAndHighlightsUpdate?: boolean;
};

export type UpdateFileEntryPayload = {
  path: string;
  content: string;
};

export type SetPreviewDataPayload = {
  previewResourceId?: string;
  previewResources?: ResourceMapType;
  alert?: AlertType;
};

export type SetDiffDataPayload = {
  diffResourceId?: string;
  diffContent?: string;
};

export type StartPreviewLoaderPayload = {
  targetResourceId: string;
  previewType: 'kustomization' | 'helm' | 'cluster';
};

function updateSelectionHistory(type: 'resource' | 'path', isVirtualSelection: boolean, state: AppState) {
  if (isVirtualSelection) {
    return;
  }
  if (type === 'resource' && state.selectedResourceId) {
    state.selectionHistory.push({
      type,
      selectedResourceId: state.selectedResourceId,
    });
  }
  if (type === 'path' && state.selectedPath) {
    state.selectionHistory.push({
      type,
      selectedPath: state.selectedPath,
    });
  }
  state.currentSelectionHistoryIndex = undefined;
}

export const updateShouldOptionalIgnoreUnsatisfiedRefs = createAsyncThunk(
  'main/resourceRefsProcessingOptions/shouldIgnoreOptionalUnsatisfiedRefs',
  async (shouldIgnore: boolean, thunkAPI) => {
    electronStore.set('main.resourceRefsProcessingOptions.shouldIgnoreOptionalUnsatisfiedRefs', shouldIgnore);
    thunkAPI.dispatch(mainSlice.actions.setShouldIgnoreOptionalUnsatisfiedRefs(shouldIgnore));
  }
);
/**
 * updates the content of the specified path to the specified value
 */
export const updateFileEntry = createAsyncThunk(
  'main/updateFileEntry',
  async (payload: UpdateFileEntryPayload, thunkAPI) => {
    const state = (<any>thunkAPI.getState()).main;
    try {
      const fileEntry = state.fileMap[payload.path];
      if (fileEntry) {
        let rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
        const filePath = path.join(rootFolder, payload.path);

        if (getFileStats(filePath)?.isDirectory() === false) {
          fs.writeFileSync(filePath, payload.content);
          fileEntry.timestamp = getFileStats(filePath)?.mtime.getTime();

          getResourcesForPath(fileEntry.filePath, state.resourceMap).forEach(r => {
            thunkAPI.dispatch(mainSlice.actions.deleteResource(r.id));
          });

          const extractedResources = await extractK8sResources(payload.content, filePath.substring(rootFolder.length));
          Object.values(extractedResources).forEach(r => {
            state.resourceMap[r.id] = r;
            r.isHighlighted = true;
          });
          reprocessResources([], state.resourceMap, state.fileMap, state.resourceRefsProcessingOptions, {
            resourceKinds: extractedResources.map(r => r.kind),
          });
        }
      } else {
        log.error(`Could not find FileEntry for ${payload.path}`);
      }
    } catch (e) {
      log.error(e);
      return original(state);
    }
  }
);
/**
 * called by the file monitor when multiple paths are added to the file system
 */
export const multiplePathsAdded = createAsyncThunk(
  'main/multiplePathsAdded',
  async (payload: {paths: Array<string>; appConfig: AppConfig}, thunkAPI) => {
    const state = (<any>thunkAPI.getState()).main;
    let filePaths: Array<string> = payload.paths;
    const appConfig = payload.appConfig;
    await parallelLimit(
      filePaths.map(filePath => async () => {
        let fileEntry = getFileEntryForAbsolutePath(filePath, state.fileMap);
        if (fileEntry) {
          if (getFileStats(filePath)?.isDirectory() === false) {
            log.info(`added file ${filePath} already exists - updating`);
            thunkAPI.dispatch(mainSlice.actions.reloadFile({filePath, fileEntry}));
          }
        } else {
          const passedFileEntry = await addFolder(filePath, state, appConfig);
          thunkAPI.dispatch(mainSlice.actions.addPath({filePath, appConfig, passedFileEntry}));
        }
      }),
      50
    );
  }
);
/**
 * called by the file monitor when multiple files are changed in the file system
 */
export const multipleFilesChanged = createAsyncThunk(
  'main/multipleFilesChanged',
  async (payload: {paths: Array<string>; appConfig: AppConfig}, thunkAPI) => {
    const state = (<any>thunkAPI.getState()).main;
    let filePaths = payload.paths;
    const appConfig = payload.appConfig;
    await parallelLimit(
      filePaths.map(filePath => async () => {
        let fileEntry = getFileEntryForAbsolutePath(filePath, state.fileMap);
        if (fileEntry) {
          thunkAPI.dispatch(mainSlice.actions.reloadFile({filePath, fileEntry}));
        } else {
          const passedFileEntry = await addFolder(filePath, state, appConfig);
          thunkAPI.dispatch(mainSlice.actions.addPath({filePath, appConfig, passedFileEntry}));
        }
      }),
      50
    );
  }
);
/**
 * called by the file monitor when a path is removed from the file system
 */
export const multiplePathsRemoved = createAsyncThunk(
  'main/multiplePathsRemoved',
  async (payload: Array<string>, thunkAPI) => {
    const state = (<any>thunkAPI.getState()).main;
    let filePaths: Array<string> = payload;
    await parallelLimit(
      filePaths.map(filePath => () => {
        let fileEntry = getFileEntryForAbsolutePath(filePath, state.fileMap);
        if (fileEntry) {
          thunkAPI.dispatch(mainSlice.actions.removePath({filePath, fileEntry}));
        } else {
          log.warn(`removed file ${filePath} not known - ignoring..`);
        }
      }),
      50
    );
  }
);

export const mainSlice = createSlice({
  name: 'main',
  initialState: initialState.main,
  reducers: {
    addResource: (state: Draft<AppState>, action: PayloadAction<K8sResource>) => {
      const resource = action.payload;
      state.resourceMap[resource.id] = resource;
    },
    deleteResource: (state: Draft<AppState>, action: PayloadAction<string>) => {
      delete state.resourceMap[action.payload];
    },
    reloadFile: (state: Draft<AppState>, action: PayloadAction<any>) => {
      reloadFile(action.payload.filePath, action.payload.fileEntry, state);
    },
    addPath: (state: Draft<AppState>, action: PayloadAction<any>) => {
      const passedFileEntry = action.payload.passedFileEntry;
      addPath(action.payload.filePath, state, action.payload.appConfig, passedFileEntry);
    },
    removePath: (state: Draft<AppState>, action: PayloadAction<any>) => {
      removePath(action.payload.filePath, state, action.payload.fileEntry);
    },
    /**
     * Updates the content of the specified resource to the specified value
     */
    updateResource: (state: Draft<AppState>, action: PayloadAction<UpdateResourcePayload>) => {
      try {
        const resource = state.resourceMap[action.payload.resourceId];
        if (resource) {
          if (isFileResource(resource)) {
            const updatedFileText = saveResource(resource, action.payload.content, state.fileMap);
            resource.text = updatedFileText;
            resource.content = parseDocument(updatedFileText).toJS();
            recalculateResourceRanges(resource, state);
          } else {
            resource.text = action.payload.content;
            resource.content = parseDocument(action.payload.content).toJS();
          }
          reprocessResources([resource.id], state.resourceMap, state.fileMap, state.resourceRefsProcessingOptions);
          if (!action.payload.preventSelectionAndHighlightsUpdate) {
            resource.isSelected = false;
            updateSelectionAndHighlights(state, resource);
          }
        }
      } catch (e) {
        log.error(e);
        return original(state);
      }
    },
    removeResource: (state: Draft<AppState>, action: PayloadAction<string>) => {
      const resourceId = action.payload;
      const resource = state.resourceMap[resourceId];
      if (!resource) {
        return;
      }
      if (state.selectedResourceId === resourceId) {
        clearResourceSelections(state.resourceMap);
      }
      if (isUnsavedResource(resource)) {
        delete state.resourceMap[resource.id];
        return;
      }
      if (isFileResource(resource)) {
        removeResourceFromFile(resource, state.fileMap, state.resourceMap);
        return;
      }
      if (state.previewType === 'cluster' && state.previewResourceId) {
        try {
          const kubeConfig = new k8s.KubeConfig();
          kubeConfig.loadFromFile(state.previewResourceId);
          const kindHandler = getResourceKindHandler(resource.kind);
          if (kindHandler?.deleteResourceInCluster) {
            kindHandler.deleteResourceInCluster(kubeConfig, resource.name, resource.namespace);
            delete state.resourceMap[resource.id];
          }
        } catch (err) {
          log.error(err);
          return original(state);
        }
      }
    },
    /**
     * Marks the specified resource as selected and highlights all related resources
     */
    selectK8sResource: (
      state: Draft<AppState>,
      action: PayloadAction<{resourceId: string; isVirtualSelection?: boolean}>
    ) => {
      const resource = state.resourceMap[action.payload.resourceId];
      if (resource) {
        updateSelectionAndHighlights(state, resource);
        updateSelectionHistory('resource', Boolean(action.payload.isVirtualSelection), state);
      }
    },
    /**
     * Marks the specified values as selected
     */
    selectHelmValuesFile: (
      state: Draft<AppState>,
      action: PayloadAction<{valuesFileId: string; isVirtualSelection?: boolean}>
    ) => {
      const valuesFileId = action.payload.valuesFileId;
      Object.values(state.helmValuesMap).forEach(values => {
        values.isSelected = values.id === valuesFileId;
      });

      state.selectedValuesFileId = state.helmValuesMap[valuesFileId].isSelected ? valuesFileId : undefined;
      selectFilePath(state.helmValuesMap[valuesFileId].filePath, state);
      updateSelectionHistory('path', Boolean(action.payload.isVirtualSelection), state);
    },
    /**
     * Marks the specified file as selected and highlights all related resources
     */
    selectFile: (state: Draft<AppState>, action: PayloadAction<{filePath: string; isVirtualSelection?: boolean}>) => {
      const filePath = action.payload.filePath;
      if (filePath.length > 0) {
        selectFilePath(filePath, state);
        updateSelectionHistory('path', Boolean(action.payload.isVirtualSelection), state);
      }
    },
    setSelectingFile: (state: Draft<AppState>, action: PayloadAction<boolean>) => {
      state.isSelectingFile = action.payload;
    },
    setApplyingResource: (state: Draft<AppState>, action: PayloadAction<boolean>) => {
      state.isApplyingResource = action.payload;
    },
    clearPreview: (state: Draft<AppState>) => {
      setPreviewData({}, state);
      state.previewType = undefined;
    },
    clearPreviewAndSelectionHistory: (state: Draft<AppState>) => {
      setPreviewData({}, state);
      state.previewType = undefined;
      state.currentSelectionHistoryIndex = undefined;
      state.selectionHistory = [];
    },
    startPreviewLoader: (state: Draft<AppState>, action: PayloadAction<StartPreviewLoaderPayload>) => {
      state.previewLoader.isLoading = true;
      state.previewLoader.targetResourceId = action.payload.targetResourceId;
      state.previewType = action.payload.previewType;
    },
    stopPreviewLoader: (state: Draft<AppState>) => {
      state.previewLoader.isLoading = false;
      state.previewLoader.targetResourceId = undefined;
    },
    updateResourceFilter: (state: Draft<AppState>, action: PayloadAction<ResourceFilterType>) => {
      state.resourceFilter = action.payload;
    },
    setShouldIgnoreOptionalUnsatisfiedRefs: (state: Draft<AppState>, action: PayloadAction<boolean>) => {
      state.resourceRefsProcessingOptions.shouldIgnoreOptionalUnsatisfiedRefs = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(previewKustomization.fulfilled, (state, action) => {
        setPreviewData(action.payload, state);
        state.previewLoader.isLoading = false;
        state.previewLoader.targetResourceId = undefined;
        resetSelectionHistory(state, {initialResourceIds: [state.previewResourceId]});
      })
      .addCase(previewKustomization.rejected, state => {
        state.previewLoader.isLoading = false;
        state.previewLoader.targetResourceId = undefined;
        state.previewType = undefined;
      });

    builder
      .addCase(previewHelmValuesFile.fulfilled, (state, action) => {
        setPreviewData(action.payload, state);
        state.previewLoader.isLoading = false;
        state.previewLoader.targetResourceId = undefined;
        state.currentSelectionHistoryIndex = undefined;
        resetSelectionHistory(state);
      })
      .addCase(previewHelmValuesFile.rejected, (state, action) => {
        state.previewLoader.isLoading = false;
        state.previewLoader.targetResourceId = undefined;
        state.previewType = undefined;
      });

    builder
      .addCase(previewCluster.fulfilled, (state, action) => {
        setPreviewData(action.payload, state);
        state.previewLoader.isLoading = false;
        state.previewLoader.targetResourceId = undefined;
        resetSelectionHistory(state, {initialResourceIds: [state.previewResourceId]});
      })
      .addCase(previewCluster.rejected, state => {
        state.previewLoader.isLoading = false;
        state.previewLoader.targetResourceId = undefined;
        state.previewType = undefined;
      });

    builder
      .addCase(repreviewCluster.fulfilled, (state, action) => {
        setPreviewData(action.payload, state);
        state.previewLoader.isLoading = false;
        state.previewLoader.targetResourceId = undefined;
        let resource = null;
        if (action && action.payload && action.payload.previewResources && state && state.selectedResourceId) {
          resource = action.payload.previewResources[state.selectedResourceId];
        }
        if (resource) {
          updateSelectionAndHighlights(state, resource);
        }
      })
      .addCase(repreviewCluster.rejected, state => {
        state.previewLoader.isLoading = false;
        state.previewLoader.targetResourceId = undefined;
        state.previewType = undefined;
      });

    builder.addCase(setRootFolder.fulfilled, (state, action) => {
      state.resourceMap = action.payload.resourceMap;
      state.fileMap = action.payload.fileMap;
      state.helmChartMap = action.payload.helmChartMap;
      state.helmValuesMap = action.payload.helmValuesMap;
      state.previewLoader.isLoading = false;
      state.previewLoader.targetResourceId = undefined;
      state.selectedResourceId = undefined;
      state.selectedPath = undefined;
      state.previewResourceId = undefined;
      state.previewType = undefined;
      resetSelectionHistory(state);
    });

    builder.addCase(performResourceDiff.fulfilled, (state, action) => {
      state.diffResourceId = action.payload.diffResourceId;
      state.diffContent = action.payload.diffContent;
    });

    builder.addCase(selectFromHistory.fulfilled, (state, action) => {
      state.currentSelectionHistoryIndex = action.payload.nextSelectionHistoryIndex;
      state.selectionHistory = action.payload.newSelectionHistory;
    });

    builder.addCase(saveUnsavedResource.fulfilled, (state, action) => {
      const rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
      const resource = state.resourceMap[action.payload.resourceId];
      const relativeFilePath = action.payload.resourceFilePath.substr(rootFolder.length);
      const resourceFileEntry = state.fileMap[relativeFilePath];
      if (resource) {
        resource.filePath = relativeFilePath;
        resource.range = action.payload.resourceRange;
      }
      if (resourceFileEntry) {
        resourceFileEntry.timestamp = action.payload.fileTimestamp;
      } else {
        const newFileEntry = createFileEntry(relativeFilePath);
        newFileEntry.timestamp = action.payload.fileTimestamp;
        state.fileMap[relativeFilePath] = newFileEntry;
        const parentPath = path.join(path.sep, path.basename(path.dirname(relativeFilePath))).trim();
        const childFileName = path.basename(relativeFilePath);
        if (parentPath === path.sep) {
          const rootFileEntry = state.fileMap[ROOT_FILE_ENTRY];
          if (rootFileEntry.children) {
            rootFileEntry.children.push(childFileName);
            rootFileEntry.children.sort();
          } else {
            rootFileEntry.children = [childFileName];
          }
        } else {
          const parentPathFileEntry = state.fileMap[parentPath];
          if (parentPathFileEntry) {
            if (parentPathFileEntry.children !== undefined) {
              parentPathFileEntry.children.push(childFileName);
              parentPathFileEntry.children.sort();
            } else {
              parentPathFileEntry.children = [childFileName];
            }
          } else {
            log.warn(`[saveUnsavedResource]: Couldn't find parent path for ${relativeFilePath}`);
          }
        }
      }
    });
  },
});

/**
 * Sets/clears preview resources
 */

function setPreviewData<State>(payload: SetPreviewDataPayload, state: AppState) {
  state.previewResourceId = undefined;
  state.previewValuesFileId = undefined;

  if (payload.previewResourceId) {
    if (state.previewType === 'kustomization') {
      if (state.resourceMap[payload.previewResourceId]) {
        state.previewResourceId = payload.previewResourceId;
      } else {
        log.error(`Unknown preview id: ${payload.previewResourceId}`);
      }
    }
    if (state.previewType === 'helm') {
      if (state.helmValuesMap[payload.previewResourceId]) {
        state.previewValuesFileId = payload.previewResourceId;
      } else {
        log.error(`Unknown preview id: ${payload.previewResourceId}`);
      }
    }
    if (state.previewType === 'cluster') {
      state.previewResourceId = payload.previewResourceId;
    }
  }

  // remove previous preview resources
  Object.values(state.resourceMap)
    .filter(r => r.filePath.startsWith(PREVIEW_PREFIX))
    .forEach(r => delete state.resourceMap[r.id]);

  if (payload.previewResourceId && payload.previewResources) {
    Object.values(payload.previewResources).forEach(r => {
      state.resourceMap[r.id] = r;
    });
  }
}

/**
 * Selects the specified filePath - used by several reducers
 */

function selectFilePath(filePath: string, state: AppState) {
  const entries = getAllFileEntriesForPath(filePath, state.fileMap);
  clearResourceSelections(state.resourceMap);

  if (entries.length > 0) {
    const parent = entries[entries.length - 1];
    getResourcesForPath(parent.filePath, state.resourceMap).forEach(r => {
      r.isHighlighted = true;
    });

    if (parent.children) {
      highlightChildrenResources(parent, state.resourceMap, state.fileMap);
    }

    Object.values(state.helmValuesMap).forEach(valuesFile => {
      valuesFile.isSelected = valuesFile.filePath === filePath;
    });
  }

  state.selectedResourceId = undefined;
  state.selectedPath = filePath;
}

export const {
  addResource,
  selectK8sResource,
  selectFile,
  setSelectingFile,
  setApplyingResource,
  updateResource,
  selectHelmValuesFile,
  clearPreview,
  clearPreviewAndSelectionHistory,
  startPreviewLoader,
  stopPreviewLoader,
  removeResource,
  updateResourceFilter,
} = mainSlice.actions;
export default mainSlice.reducer;
