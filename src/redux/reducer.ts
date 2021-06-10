import {initialState} from "./initialState";
import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';
import path from 'path';
import { AppConfig, AppState, FileEntry, FileMapType, K8sResource, ResourceMapType } from '../models/state';
import { clearResourceSelections, getLinkedResources, selectKustomizationRefs } from './utils/selection';
import { readFiles, selectResourceFileEntry } from './utils/fileEntry';
import { processKustomizations } from './utils/kustomize';
import { processConfigMaps, processServices } from './utils/resource';

type SetRootFolderPayload = {
  rootFolder: string,
  appConfig: AppConfig,
  rootEntry?: FileEntry,
  resourceMap: ResourceMapType,
  fileMap: FileMapType
}

export const mainSlice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    setFilterObjects: (state:Draft<AppState>, action:PayloadAction<boolean>) => {
      console.log( "Setting filter to " + action.payload)
      state.appConfig.settings.filterObjectsOnSelection = action.payload
    },
    rootFolderSet: (state:Draft<AppState>, action:PayloadAction<SetRootFolderPayload>) => {
      if (action.payload.rootEntry) {
        var rootFolder = path.join(action.payload.rootEntry.folder, action.payload.rootEntry.name);
        state.statusText = "Loaded folder " + rootFolder
        state.fileMap = action.payload.fileMap
        state.resourceMap = action.payload.resourceMap
        state.files = action.payload.rootEntry.children ? action.payload.rootEntry.children : []
      }
    },
    selectKustomization: (state:Draft<AppState>, action:PayloadAction<string>) => {
      const resource = state.resourceMap[action.payload]
      if (resource) {
        clearResourceSelections(state.resourceMap, resource.id)
        selectResourceFileEntry(resource, state.fileMap, state.rootFolder)

        if (resource.selected) {
          resource.selected = false
        } else {
          resource.selected = true
          selectKustomizationRefs(state.resourceMap,resource.id).forEach( e => state.resourceMap[e].highlight = true)
        }
      }
    },
    selectK8sResource: (state:Draft<AppState>, action:PayloadAction<string>) => {
      const resource = state.resourceMap[action.payload]
      if (resource) {
        clearResourceSelections(state.resourceMap, resource.id)
        selectResourceFileEntry(resource, state.fileMap, state.rootFolder)

        if (resource.selected) {
          resource.selected = false
        } else {
          resource.selected = true
          getLinkedResources(resource).forEach( e => state.resourceMap[e].highlight = true)
        }
      }
    }
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
      fileMap: toFileMapType( fileMap )
    }

    dispatch(rootFolderSet(payload))
  }
}

function toResourceMapType(resourceMap: Map<string, K8sResource>) {
  const result : ResourceMapType = {}
  Array.from( resourceMap.values() ).forEach( e => result[e.id] = e )
  return result;
}

function toFileMapType(fileMap: Map<string, FileEntry>) {
  const result : FileMapType = {}

  Array.from( fileMap.keys() ).forEach( e => {
    const path = fileMap.get( e );
    if( path ){
      result[e] = path
    }
  })

  return result;
}


export const { setFilterObjects, rootFolderSet, selectKustomization, selectK8sResource } = mainSlice.actions
export default mainSlice.reducer

