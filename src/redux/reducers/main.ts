import log from 'loglevel';
import {createSlice, Draft, original, PayloadAction} from '@reduxjs/toolkit';
import path from 'path';
import {PREVIEW_PREFIX, ROOT_FILE_ENTRY} from '@src/constants';
import {AppConfig} from '@models/appconfig';
import {AppState, FileMapType, ResourceMapType} from '@models/appstate';
import {parseDocument} from 'yaml';
import fs from 'fs';
import {diffResource, previewCluster, previewKustomization, setRootFolder} from '@redux/reducers/thunks';
import {initialState} from '../initialState';
import {
  clearFileSelections,
  clearResourceSelections,
  highlightChildrenResources,
  updateSelectionAndHighlights,
} from '../utils/selection';
import {
  addPath,
  removePath,
  getAllFileEntriesForPath,
  getFileEntryForAbsolutePath,
  getResourcesForPath,
  reloadFile,
} from '../utils/fileEntry';
import {extractK8sResources, recalculateResourceRanges, reprocessResources, saveResource} from '../utils/resource';

export type SetRootFolderPayload = {
  appConfig: AppConfig;
  fileMap: FileMapType;
  resourceMap: ResourceMapType;
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
};

export type SetDiffDataPayload = {
  diffResourceId?: string;
  diffContent?: string;
};

export const mainSlice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    /**
     * called by the file monitor when a path is added to the file system
     */
    pathAdded: (state: Draft<AppState>, action: PayloadAction<string>) => {
      let filePath = action.payload;
      let fileEntry = getFileEntryForAbsolutePath(filePath, state.fileMap);
      if (fileEntry) {
        log.info(`added file ${filePath} already exists - updating`);
        reloadFile(filePath, fileEntry, state);
      } else {
        addPath(filePath, state);
      }
    },
    /**
     * called by the file monitor when a file is changed in the file system
     */
    fileChanged: (state: Draft<AppState>, action: PayloadAction<string>) => {
      let filePath = action.payload;
      let fileEntry = getFileEntryForAbsolutePath(filePath, state.fileMap);
      if (fileEntry) {
        reloadFile(filePath, fileEntry, state);
      } else {
        addPath(filePath, state);
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

            const resources = extractK8sResources(action.payload.content, filePath.substring(rootFolder.length));
            Object.values(resources).forEach(r => {
              state.resourceMap[r.id] = r;
              r.highlight = true;
            });

            reprocessResources([], state.resourceMap, state.fileMap);
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
          resource.selected = false;
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
    selectK8sResource: (state: Draft<AppState>, action: PayloadAction<string>) => {
      const resource = state.resourceMap[action.payload];
      if (resource) {
        updateSelectionAndHighlights(state, resource);
      }
    },
    /**
     * Marks the specified file as selected and highlights all related resources
     */
    selectFile: (state: Draft<AppState>, action: PayloadAction<string>) => {
      if (action.payload.length > 0) {
        const entries = getAllFileEntriesForPath(action.payload, state.fileMap);
        clearResourceSelections(state.resourceMap);
        clearFileSelections(state.fileMap);

        if (entries.length > 0) {
          entries
            .filter(e => e.children)
            .forEach(e => {
              e.expanded = true;
            });

          const parent = entries[entries.length - 1];
          getResourcesForPath(parent.filePath, state.resourceMap).forEach(r => {
            r.highlight = true;
          });

          if (parent.children) {
            highlightChildrenResources(parent, state.resourceMap, state.fileMap);
          }
        }

        state.selectedResource = undefined;
        state.selectedPath = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      previewKustomization.fulfilled, (state, action) => {
        setPreviewData(action.payload, state);
      });

    builder.addCase(
      previewCluster.fulfilled, (state, action) => {
        setPreviewData(action.payload, state);
      });

    builder.addCase(
      setRootFolder.fulfilled, (state, action) => {
        state.resourceMap = action.payload.resourceMap;
        state.fileMap = action.payload.fileMap;
        state.selectedResource = undefined;
        state.selectedPath = undefined;
        state.previewResource = undefined;
      });

    builder.addCase(
      diffResource.fulfilled, (state, action) => {
        state.diffResource = action.payload.diffResourceId;
        state.diffContent = action.payload.diffContent;
      },
    );
  },
});

/**
 * Sets/clears preview resources
 */

function setPreviewData<State>(payload: SetPreviewDataPayload, state: AppState) {
  state.previewResource = payload.previewResourceId;

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

export const {selectK8sResource, selectFile, updateResource, updateFileEntry, pathAdded, fileChanged, pathRemoved} =
  mainSlice.actions;
export default mainSlice.reducer;
