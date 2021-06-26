import {exec} from 'child_process';
import log from 'loglevel';
// @ts-ignore
import shellPath from 'shell-path';
import {createSlice, Draft, original, PayloadAction} from '@reduxjs/toolkit';
import path from 'path';
import {PREVIEW_PREFIX} from '@src/constants';
import {AppConfig} from '@models/appconfig';
import {AppState, ResourceMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';
import {parseDocument} from 'yaml';
import {K8sResource} from '@models/k8sresource';
import {initialState} from '../initialState';
import {
  clearFileSelections,
  clearResourceSelections,
  getLinkedResources,
  highlightChildren,
  getKustomizationRefs,
} from '../utils/selection';
import {extractK8sResources, getFileEntryForResource, readFiles, selectResourceFileEntry} from '../utils/fileEntry';
import {processKustomizations} from '../utils/kustomize';
import {isKustomizationResource, processConfigMaps, processServices, saveResource} from '../utils/resource';
import {AppDispatch} from '../store';

type SetRootFolderPayload = {
  rootFolder: string;
  appConfig: AppConfig;
  rootEntry?: FileEntry;
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

export const mainSlice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    updateResource: (state: Draft<AppState>, action: PayloadAction<UpdateResourcePayload>) => {
      try {
        const resource = state.resourceMap[action.payload.resourceId];
        if (resource) {
          const value = saveResource(resource, action.payload.content);
          resource.text = value;
          resource.content = parseDocument(value).toJS();
          recalculateResourceRanges(resource, state, value);
        }
      } catch (e) {
        log.error(e);
        return original(state);
      }
    },
    rootFolderSet: (state: Draft<AppState>, action: PayloadAction<SetRootFolderPayload>) => {
      if (action.payload.rootEntry) {
        state.resourceMap = action.payload.resourceMap;
        state.rootFolder = action.payload.rootFolder;
        state.rootEntry = action.payload.rootEntry;
        state.selectedResource = undefined;
        state.selectedPath = undefined;
        state.previewResource = undefined;
      }
    },
    setPreviewData: (state: Draft<AppState>, action: PayloadAction<SetPreviewDataPayload>) => {
      state.previewResource = action.payload.previewResourceId;

      // remove previous preview resources
      Object.values(state.resourceMap)
        .filter(r => r.path.startsWith(PREVIEW_PREFIX))
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
        clearResourceSelections(state.resourceMap, resource.id);
        if (!state.previewResource) {
          clearFileSelections(state.rootEntry);
        }
        state.selectedResource = undefined;

        if (resource.selected) {
          resource.selected = false;
        } else {
          resource.selected = true;
          state.selectedResource = resource.id;
          state.selectedPath = selectResourceFileEntry(resource, state.rootEntry);

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
    },
    selectFile: (state: Draft<AppState>, action: PayloadAction<number[]>) => {
      if (action.payload.length > 0) {
        let parent = state.rootEntry;
        let selectedPath = '';
        for (let c = 0; c < action.payload.length; c += 1) {
          const index = action.payload[c];
          if (parent.children && index < parent.children.length) {
            parent = parent.children[index];
            selectedPath = path.join(selectedPath, parent.name);
          } else {
            break;
          }
        }

        clearResourceSelections(state.resourceMap);
        clearFileSelections(state.rootEntry);
        if (parent.resourceIds && parent.resourceIds.length > 0) {
          parent.resourceIds.forEach(e => {
            state.resourceMap[e].highlight = true;
          });
        } else if (parent.children) {
          highlightChildren(parent, state.resourceMap);
        }

        state.selectedResource = undefined;
        state.selectedPath = selectedPath;
      }
    },
  },
});

function processParsedResources(resourceMap: ResourceMapType) {
  processServices(resourceMap);
  processConfigMaps(resourceMap);
}

export function setRootFolder(rootFolder: string, appConfig: AppConfig) {
  return async (dispatch: AppDispatch) => {
    const folderPath = path.parse(rootFolder);
    const resourceMap: ResourceMapType = {};
    const fileMap: Map<string, FileEntry> = new Map();

    const rootEntry: FileEntry = {
      name: folderPath.name,
      folder: folderPath.dir,
      highlight: false,
      selected: false,
      expanded: false,
      excluded: false,
      children: [],
    };

    rootEntry.children = readFiles(rootFolder, appConfig, resourceMap, fileMap, rootEntry, rootFolder);
    processKustomizations(resourceMap, fileMap);
    processParsedResources(resourceMap);

    const payload: SetRootFolderPayload = {
      rootFolder,
      appConfig,
      rootEntry,
      resourceMap,
    };

    dispatch(mainSlice.actions.rootFolderSet(payload));
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
      if (resource && resource.path) {
        const folder = resource.path.substr(0, resource.path.lastIndexOf(path.sep));
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

            const resources = extractK8sResources(stdout, PREVIEW_PREFIX + resource.id);
            processParsedResources(resources);

            dispatch(mainSlice.actions.setPreviewData({previewResourceId: id, previewResources: resources}));
          }
        );
      }
    }
  };
}

function recalculateResourceRanges(resource: Draft<K8sResource>, state: Draft<AppState>, value: string) {
  // if length of value has changed we need to recalculate document ranges for
  // subsequent resource so future saves will be at correct place in document
  if (resource.range && resource.range[1] - resource.range[0] !== value.length) {
    const fileEntry = getFileEntryForResource(resource, state.rootEntry);
    if (fileEntry && fileEntry.resourceIds) {
      let resourceIndex = fileEntry.resourceIds.indexOf(resource.id);
      if (resourceIndex !== -1) {
        const diff = value.length - (resource.range[1] - resource.range[0]);
        resource.range[1] = resource.range[0] + value.length;

        while (resourceIndex < fileEntry.resourceIds.length - 1) {
          resourceIndex += 1;
          let rid = fileEntry.resourceIds[resourceIndex];
          const r = state.resourceMap[rid];
          if (r && r.range) {
            r.range[0] += diff;
            r.range[1] += diff;
          } else {
            throw new Error(`Failed to find resource ${rid} in fileEntry resourceIds for ${fileEntry.name}`);
          }
        }
      } else {
        throw new Error(`Failed to find resource in list of ids of fileEntry for ${fileEntry.name}`);
      }
    } else {
      throw new Error(`Failed to find fileEntry for resource with path ${resource.path}`);
    }
  }
}

export const {selectK8sResource, selectFile, updateResource} = mainSlice.actions;
export default mainSlice.reducer;
