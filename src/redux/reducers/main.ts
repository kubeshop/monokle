import { initialState } from '../initialState';
import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';
import path from 'path';
import { AppConfig, AppState, FileEntry, K8sResource, ResourceMapType } from '../../models/state';
import {
  clearFileSelections,
  clearResourceSelections,
  getLinkedResources,
  highlightChildren,
  getKustomizationRefs,
} from '../utils/selection';
import { readFiles, selectResourceFileEntry } from '../utils/fileEntry';
import { processKustomizations } from '../utils/kustomize';
import { processConfigMaps, processServices } from '../utils/resource';
import { AppDispatch } from '../store';

type SetRootFolderPayload = {
  rootFolder: string,
  appConfig: AppConfig,
  rootEntry?: FileEntry,
  resourceMap: ResourceMapType
}

export const mainSlice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    rootFolderSet: (state:Draft<AppState>, action:PayloadAction<SetRootFolderPayload>) => {
      if (action.payload.rootEntry) {
        state.resourceMap = action.payload.resourceMap;
        state.rootFolder = action.payload.rootFolder;
        state.rootEntry = action.payload.rootEntry;
        state.selectedResource = undefined;
        state.selectedPath = undefined;
      }
    },
    selectKustomization: (state:Draft<AppState>, action:PayloadAction<string>) => {
      const resource = state.resourceMap[action.payload]
      if (resource) {
        clearResourceSelections(state.resourceMap, resource.id);
        clearFileSelections(state.rootEntry);
        state.selectedResource = undefined;

        if (resource.selected) {
          resource.selected = false
        } else {
          resource.selected = true;
          state.selectedResource = resource.id;
          state.selectedPath = selectResourceFileEntry(resource, state.rootEntry);
          getKustomizationRefs(state.resourceMap, resource.id, true).forEach(e => state.resourceMap[e].highlight = true);
        }
      }
    },
    selectK8sResource: (state:Draft<AppState>, action:PayloadAction<string>) => {
      const resource = state.resourceMap[action.payload]
      if (resource) {
        clearResourceSelections(state.resourceMap, resource.id);
        clearFileSelections(state.rootEntry);
        state.selectedResource = undefined;

        if (resource.selected) {
          resource.selected = false;
        } else {
          resource.selected = true;
          state.selectedResource = resource.id;
          state.selectedPath = selectResourceFileEntry(resource, state.rootEntry);
          getLinkedResources(resource).forEach(e => state.resourceMap[e].highlight = true);
        }
      }
    },
    selectFile: (state: Draft<AppState>, action: PayloadAction<number[]>) => {
      if (action.payload.length > 0) {
        let parent = state.rootEntry;
        let selectedPath = '';
        for (var c = 0; c < action.payload.length; c++) {
          const index = action.payload[c];
          // @ts-ignore
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
          parent.resourceIds.forEach(e => state.resourceMap[e].highlight = true);
        } else if (parent.children) {
          highlightChildren(parent, state.resourceMap);
        }

        state.selectedResource = undefined;
        state.selectedPath = selectedPath;
      }
    },
  }
})

export function setRootFolder(rootFolder: string, appConfig: AppConfig) {
  return async (dispatch: AppDispatch) => {
    const folderPath = path.parse(rootFolder);
    const resourceMap: Map<string, K8sResource> = new Map();
    const fileMap: Map<string, FileEntry> = new Map();

    const rootEntry: FileEntry = {
      name: folderPath.name,
      folder: folderPath.dir,
      highlight: false,
      selected: false,
      expanded: false,
      excluded: false,
      children: []
    };

    rootEntry.children = readFiles(rootFolder, appConfig, resourceMap, fileMap, rootEntry, rootFolder);
    processKustomizations(rootEntry, resourceMap, fileMap)
    processServices(rootEntry, resourceMap)
    processConfigMaps(rootEntry, resourceMap)

    const payload: SetRootFolderPayload = {
      rootFolder: rootFolder,
      appConfig: appConfig,
      rootEntry: rootEntry,
      resourceMap: toResourceMapType( resourceMap ),
    }

    dispatch(rootFolderSet(payload))
  }
}

function toResourceMapType(resourceMap: Map<string, K8sResource>) {
  const result : ResourceMapType = {}
  Array.from( resourceMap.values() ).forEach( e => result[e.id] = e )
  return result;
}

export const { rootFolderSet, selectKustomization, selectK8sResource, selectFile } = mainSlice.actions;
export default mainSlice.reducer

