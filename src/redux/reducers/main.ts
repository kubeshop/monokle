import log from 'loglevel';
import {createSlice, Draft, original, PayloadAction} from '@reduxjs/toolkit';
import path from 'path';
import {PREVIEW_PREFIX, ROOT_FILE_ENTRY} from '@constants/constants';
import {AppConfig} from '@models/appconfig';
import {AppState, FileMapType, HelmChartMapType, HelmValuesMapType, ResourceMapType} from '@models/appstate';
import {parseDocument} from 'yaml';
import fs from 'fs';
import {previewKustomization} from '@redux/thunks/previewKustomization';
import {previewCluster} from '@redux/thunks/previewCluster';
import {setRootFolder} from '@redux/thunks/setRootFolder';
import {performResourceDiff} from '@redux/thunks/diffResource';
import {previewHelmValuesFile} from '@redux/thunks/previewHelmValuesFile';
import {selectFromHistory} from '@redux/thunks/selectionHistory';
import {resetSelectionHistory} from '@redux/services/selectionHistory';
import {AlertType} from '@models/alert';
import initialState from '../initialState';
import {clearResourceSelections, highlightChildrenResources, updateSelectionAndHighlights} from '../services/selection';
import {
  addPath,
  removePath,
  getAllFileEntriesForPath,
  getFileEntryForAbsolutePath,
  getResourcesForPath,
  reloadFile,
} from '../services/fileEntry';
import {extractK8sResources, recalculateResourceRanges, reprocessResources, saveResource} from '../services/resource';

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

export const mainSlice = createSlice({
  name: 'main',
  initialState: initialState.main,
  reducers: {
    /**
     * called by the file monitor when a path is added to the file system
     */
    pathAdded: (state: Draft<AppState>, action: PayloadAction<{path: string; appConfig: AppConfig}>) => {
      let filePath = action.payload.path;
      const appConfig = action.payload.appConfig;
      let fileEntry = getFileEntryForAbsolutePath(filePath, state.fileMap);
      if (fileEntry) {
        if (!fs.statSync(filePath).isDirectory()) {
          log.info(`added file ${filePath} already exists - updating`);
          reloadFile(filePath, fileEntry, state);
        }
      } else {
        addPath(filePath, state, appConfig);
      }
    },
    /**
     * called by the file monitor when a file is changed in the file system
     */
    fileChanged: (state: Draft<AppState>, action: PayloadAction<{path: string; appConfig: AppConfig}>) => {
      let filePath = action.payload.path;
      const appConfig = action.payload.appConfig;
      let fileEntry = getFileEntryForAbsolutePath(filePath, state.fileMap);
      if (fileEntry) {
        reloadFile(filePath, fileEntry, state);
      } else {
        addPath(filePath, state, appConfig);
      }
    },
    /**
     * called by the file monitor when a path is removed from the file system
     */
    pathRemoved: (state: Draft<AppState>, action: PayloadAction<string>) => {
      let filePath = action.payload;
      let fileEntry = getFileEntryForAbsolutePath(filePath, state.fileMap);
      if (fileEntry) {
        removePath(filePath, state, fileEntry);
      } else {
        log.warn(`removed file ${filePath} not known - ignoring..`);
      }
    },
    /**
     * updates the content of the specified path to the specified value
     */
    updateFileEntry: (state: Draft<AppState>, action: PayloadAction<UpdateFileEntryPayload>) => {
      try {
        const fileEntry = state.fileMap[action.payload.path];
        if (fileEntry) {
          let rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
          const filePath = path.join(rootFolder, action.payload.path);

          if (!fs.statSync(filePath).isDirectory()) {
            fs.writeFileSync(filePath, action.payload.content);
            fileEntry.timestamp = fs.statSync(filePath).mtime.getTime();

            getResourcesForPath(fileEntry.filePath, state.resourceMap).forEach(r => {
              delete state.resourceMap[r.id];
            });

            const extractedResources = extractK8sResources(
              action.payload.content,
              filePath.substring(rootFolder.length)
            );
            Object.values(extractedResources).forEach(r => {
              state.resourceMap[r.id] = r;
              r.isHighlighted = true;
            });
            reprocessResources([], state.resourceMap, state.fileMap, {
              resourceKinds: extractedResources.map(r => r.kind),
            });
          }
        } else {
          log.error(`Could not find FileEntry for ${action.payload.path}`);
        }
      } catch (e) {
        log.error(e);
        return original(state);
      }
    },
    /**
     * Updates the content of the specified resource to the specified value
     */
    updateResource: (state: Draft<AppState>, action: PayloadAction<UpdateResourcePayload>) => {
      try {
        const resource = state.resourceMap[action.payload.resourceId];
        if (resource) {
          const value = saveResource(resource, action.payload.content, state.fileMap);
          resource.text = value;
          resource.content = parseDocument(value).toJS();
          recalculateResourceRanges(resource, state);
          reprocessResources([resource.id], state.resourceMap, state.fileMap);
          resource.isSelected = false;
          updateSelectionAndHighlights(state, resource);
        }
      } catch (e) {
        log.error(e);
        return original(state);
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
  console.log('selectFilePath', filePath, state.fileMap);
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
  selectK8sResource,
  selectFile,
  setSelectingFile,
  setApplyingResource,
  updateResource,
  updateFileEntry,
  pathAdded,
  fileChanged,
  pathRemoved,
  selectHelmValuesFile,
  clearPreview,
  clearPreviewAndSelectionHistory,
  startPreviewLoader,
  stopPreviewLoader,
} = mainSlice.actions;
export default mainSlice.reducer;
