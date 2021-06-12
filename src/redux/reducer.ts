import {initialState} from "./initialState";
import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';
import path from 'path';
import { AppConfig, AppState, FileEntry, K8sResource, ResourceMapType } from '../models/state';
import {
  clearResourceSelections,
  getLinkedResources,
  highlightChildren,
  selectKustomizationRefs,
} from './utils/selection';
import { readFiles, selectResourceFileEntry } from './utils/fileEntry';
import { processKustomizations } from './utils/kustomize';
import { processConfigMaps, processServices } from './utils/resource';

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
    setFilterObjects: (state:Draft<AppState>, action:PayloadAction<boolean>) => {
      state.appConfig.settings.filterObjectsOnSelection = action.payload
    },
    rootFolderSet: (state:Draft<AppState>, action:PayloadAction<SetRootFolderPayload>) => {
      if (action.payload.rootEntry) {
        state.statusText = "Loaded folder " + action.payload.rootFolder
        state.resourceMap = action.payload.resourceMap
        state.rootFolder = action.payload.rootFolder
        state.rootEntry = action.payload.rootEntry
      }
    },
    selectKustomization: (state:Draft<AppState>, action:PayloadAction<string>) => {
      const resource = state.resourceMap[action.payload]
      if (resource) {
        clearResourceSelections(state.resourceMap, resource.id)
        selectResourceFileEntry(resource, state.rootEntry)

        if (resource.selected) {
          resource.selected = false
        } else {
          resource.selected = true;
          selectKustomizationRefs(state.resourceMap, resource.id, true).forEach(e => state.resourceMap[e].highlight = true);
        }
      }
    },
    selectK8sResource: (state:Draft<AppState>, action:PayloadAction<string>) => {
      const resource = state.resourceMap[action.payload]
      if (resource) {
        clearResourceSelections(state.resourceMap, resource.id);
        selectResourceFileEntry(resource, state.rootEntry);

        if (resource.selected) {
          resource.selected = false;
        } else {
          resource.selected = true;
          getLinkedResources(resource).forEach(e => state.resourceMap[e].highlight = true);
        }
      }
    },
    selectFile: (state: Draft<AppState>, action: PayloadAction<number[]>) => {
      if (action.payload.length > 0) {
        let parent = state.rootEntry;
        for (var c = 0; c < action.payload.length; c++) {
          const index = action.payload[c];
          console.log('checking index ' + index);
          // @ts-ignore
          if (parent.children && index < parent.children.length) {
            parent = parent.children[index];
          } else {
            break;
          }
        }

        clearResourceSelections(state.resourceMap);
        if (parent.resourceIds && parent.resourceIds.length > 0) {
          parent.resourceIds.forEach(e => state.resourceMap[e].highlight = true);
        } else if (parent.children) {
          highlightChildren(parent, state.resourceMap);
        }
      }
    },
  }
})

export function setRootFolder(rootFolder: string, appConfig: AppConfig) {
  return async (dispatch:any) => {
    const folderPath = path.parse(rootFolder)
    const resourceMap: Map<string, K8sResource> = new Map()
    const fileMap: Map<string, FileEntry> = new Map()

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

export const { setFilterObjects, rootFolderSet, selectKustomization, selectK8sResource, selectFile } = mainSlice.actions;
export default mainSlice.reducer

