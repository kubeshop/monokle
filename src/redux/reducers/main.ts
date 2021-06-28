import {exec} from 'child_process';
import log from 'loglevel';
// @ts-ignore
import shellPath from 'shell-path';
import {createSlice, Draft, original, PayloadAction} from '@reduxjs/toolkit';
import path from 'path';
import {PREVIEW_PREFIX, ROOT_FILE_ENTRY} from '@src/constants';
import {AppConfig} from '@models/appconfig';
import {AppState, FileMapType, ResourceMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';
import {parseDocument} from 'yaml';
import fs from 'fs';
import {K8sResource} from '@models/k8sresource';
import {initialState} from '../initialState';
import {
  clearFileSelections,
  clearResourceSelections,
  getLinkedResources,
  highlightChildren,
  getKustomizationRefs,
} from '../utils/selection';
import {
  extractK8sResources,
  getFileEntries,
  getResourcesInFile,
  readFiles,
  selectResourceFileEntry,
} from '../utils/fileEntry';
import {processKustomizations} from '../utils/kustomize';
import {
  isKustomizationResource,
  processParsedResources,
  recalculateResourceRanges,
  reprocessResources,
  saveResource,
} from '../utils/resource';
import {AppDispatch} from '../store';

type SetRootFolderPayload = {
  appConfig: AppConfig;
  fileMap: FileMapType;
  resourceMap: ResourceMapType;
};

type SetPreviewDataPayload = {
  previewResourceId?: string;
  previewResources?: ResourceMapType;
};

export type UpdateResourcePayload = {
  resourceId: string;
  content: string;
};

export type UpdateFileEntryPayload = {
  path: string;
  content: string;
};

export const mainSlice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    updateFileEntry: (state: Draft<AppState>, action: PayloadAction<UpdateFileEntryPayload>) => {
      try {
        const entry = state.fileMap[action.payload.path];
        if (entry) {
          const filePath = path.join(state.fileMap[ROOT_FILE_ENTRY].filePath, action.payload.path);

          if (!fs.statSync(filePath).isDirectory()) {
            fs.writeFileSync(filePath, action.payload.content);

            getResourcesInFile(entry.filePath, state.resourceMap).forEach(r => {
              delete state.resourceMap[r.id];
            });

            const map = extractK8sResources(action.payload.content, filePath);
            Object.values(map).forEach(r => {
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
    updateResource: (state: Draft<AppState>, action: PayloadAction<UpdateResourcePayload>) => {
      try {
        const resource = state.resourceMap[action.payload.resourceId];
        if (resource) {
          const value = saveResource(resource, action.payload.content, state.fileMap);
          resource.text = value;
          resource.content = parseDocument(value).toJS();
          recalculateResourceRanges(resource, state, value);
          reprocessResources([resource.id], state.resourceMap, state.fileMap);
          resource.selected = false;
          updateSelectionAndHighlights(state, resource);
        }
      } catch (e) {
        log.error(e);
        return original(state);
      }
    },
    rootFolderSet: (state: Draft<AppState>, action: PayloadAction<SetRootFolderPayload>) => {
      state.resourceMap = action.payload.resourceMap;
      state.fileMap = action.payload.fileMap;
      state.selectedResource = undefined;
      state.selectedPath = undefined;
      state.previewResource = undefined;
    },
    setPreviewData: (state: Draft<AppState>, action: PayloadAction<SetPreviewDataPayload>) => {
      state.previewResource = action.payload.previewResourceId;

      // remove previous preview resources
      Object.values(state.resourceMap)
        .filter(r => r.filePath.startsWith(PREVIEW_PREFIX))
        .forEach(r => delete state.resourceMap[r.id]);

      if (action.payload.previewResourceId && action.payload.previewResources) {
        Object.values(action.payload.previewResources).forEach(r => {
          state.resourceMap[r.id] = r;
        });
      }
    },
    selectK8sResource: (state: Draft<AppState>, action: PayloadAction<string>) => {
      const resource = state.resourceMap[action.payload];
      if (resource) {
        updateSelectionAndHighlights(state, resource);
      }
    },
    selectFile: (state: Draft<AppState>, action: PayloadAction<string>) => {
      if (action.payload.length > 0) {
        const selectedPath = action.payload;
        const entries = getFileEntries(action.payload, state.fileMap);
        console.log('entries: ', entries);

        clearResourceSelections(state.resourceMap);
        clearFileSelections(state.fileMap);

        if (entries.length > 0) {
          const parent = entries[entries.length - 1];

          console.log(`looking for resources in file ${parent.filePath}`, state.resourceMap);
          getResourcesInFile(parent.filePath, state.resourceMap).forEach(r => {
            r.highlight = true;
          });

          if (parent.children) {
            highlightChildren(parent, state.resourceMap, state.fileMap);
          }
        }

        state.selectedResource = undefined;
        state.selectedPath = selectedPath;
      }
    },
  },
});

export function setRootFolder(rootFolder: string, appConfig: AppConfig) {
  return async (dispatch: AppDispatch) => {
    const folderPath = path.parse(rootFolder);
    const resourceMap: ResourceMapType = {};
    const fileMap: FileMapType = {};

    const rootEntry: FileEntry = {
      name: folderPath.name,
      filePath: rootFolder,
      highlight: false,
      selected: false,
      expanded: false,
      excluded: false,
      children: [],
    };

    fileMap[ROOT_FILE_ENTRY] = rootEntry;

    rootEntry.children = readFiles(rootFolder, appConfig, resourceMap, fileMap);
    processKustomizations(resourceMap, fileMap);
    processParsedResources(resourceMap);

    dispatch(
      mainSlice.actions.rootFolderSet({
        appConfig,
        fileMap,
        resourceMap,
      })
    );
  };
}

export function previewKustomization(id: string) {
  // eslint-disable-next-line no-unused-vars
  return async (dispatch: AppDispatch, getState: any) => {
    const state: AppState = getState().main;
    if (state.previewResource === id) {
      dispatch(mainSlice.actions.setPreviewData({}));
    } else {
      const resource = state.resourceMap[id];
      if (resource && resource.filePath) {
        const rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
        const folder = path.join(rootFolder, resource.filePath.substr(0, resource.filePath.lastIndexOf(path.sep)));
        log.info(`previewing ${id} in folder ${folder}`);

        // need to run kubectl for this since the kubernetes client doesn't support kustomization commands
        exec(
          'kubectl kustomize ./',
          {
            cwd: folder,
            env: {
              NODE_ENV: process.env.NODE_ENV,
              PUBLIC_URL: process.env.PUBLIC_URL,
              PATH: shellPath.sync(),
            },
          },
          (error, stdout, stderr) => {
            if (error) {
              log.error(`Failed to generate kustomizations: ${error.message}`);
              return;
            }
            if (stderr) {
              log.error(`Failed to generate kustomizations: ${stderr}`);
              return;
            }

            const resourceMap: ResourceMapType = {};

            extractK8sResources(stdout, PREVIEW_PREFIX + resource.id).forEach(r => {
              resourceMap[r.id] = r;
            });
            processParsedResources(resourceMap);

            dispatch(mainSlice.actions.setPreviewData({previewResourceId: id, previewResources: resourceMap}));
          }
        );
      }
    }
  };
}

function updateSelectionAndHighlights(state: AppState, resource: K8sResource) {
  clearResourceSelections(state.resourceMap, resource.id);
  if (!state.previewResource) {
    clearFileSelections(state.fileMap);
  }
  state.selectedResource = undefined;

  if (resource.selected) {
    resource.selected = false;
  } else {
    resource.selected = true;
    state.selectedResource = resource.id;
    state.selectedPath = selectResourceFileEntry(resource, state.fileMap);

    if (isKustomizationResource(resource)) {
      getKustomizationRefs(state.resourceMap, resource.id, true).forEach(e => {
        state.resourceMap[e].highlight = true;
      });
    } else {
      getLinkedResources(resource).forEach(e => {
        state.resourceMap[e].highlight = true;
      });
    }
  }
}

export const {selectK8sResource, selectFile, updateResource, updateFileEntry} = mainSlice.actions;
export default mainSlice.reducer;
