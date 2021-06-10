import {AppConfig, FileEntry, K8sResource} from "../models/state";
import {
  SELECT_K8SRESOURCE,
  SELECT_KUSTOMIZATION,
  SelectK8sResourceAction,
  SelectK8sResourceDispatchType,
  SelectKustomizationAction,
  SelectKustomizationDispatchType,
  SET_FILTER_OBJECTS,
  SET_ROOT_FOLDER,
  SetFilterObjectsDispatchType,
  SetRootFolderAction,
  SetRootFolderDispatchType
} from "./actionTypes";
import path from "path";
import {processConfigMaps, processServices} from "./utils/resource";
import {readFiles} from "./utils/fileEntry";
import {clearResourceSelections, selectKustomizationRefs, selectLinkedResources} from "./utils/selection";
import {processKustomizations} from "./utils/kustomize";

export function setFilterObjectsOnSelection(value: boolean) {
  return (dispatch: SetFilterObjectsDispatchType) => {
    dispatch({
      type: SET_FILTER_OBJECTS,
      filterObjectsOnSelection: value
    })
  }
}

export function selectK8sResource(itemId: string, resourceMap: Map<string, K8sResource>) {
  return (dispatch: SelectK8sResourceDispatchType) => {
    const action: SelectK8sResourceAction = {
      type: SELECT_K8SRESOURCE,
    }

    const resource = resourceMap.get(itemId)
    if (resource) {
      clearResourceSelections(resourceMap, itemId)

      if (resource.selected) {
        resource.selected = false
      } else {
        resource.selected = true
        action.resourceId = resource.id
        action.linkedResourceIds = selectLinkedResources(resourceMap, resource);
      }
    }

    dispatch(action)
  }
}

export function selectKustomization(itemId: string, resourceMap: Map<string, K8sResource>) {
  return (dispatch: SelectKustomizationDispatchType) => {
    const action: SelectKustomizationAction = {
      type: SELECT_KUSTOMIZATION,
    }

    const resource = resourceMap.get(itemId)
    if (resource) {
      clearResourceSelections(resourceMap, itemId);

      if (resource.selected) {
        resource.selected = false
      } else {
        resource.selected = true
        action.kustomizationResourceId = resource.id
        action.linkedResourceIds = selectKustomizationRefs(resourceMap, itemId);
      }

      dispatch(action)
    }
  }
}

export function setRootFolder(rootFolder: string, appConfig: AppConfig) {
  return (dispatch: SetRootFolderDispatchType) => {
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

    const action: SetRootFolderAction = {
      type: SET_ROOT_FOLDER,
      rootFolder: rootFolder,
      appConfig: appConfig,
      resources: [],
      rootEntry: rootEntry,
      resourceMap: resourceMap,
      fileMap: fileMap
    }

    dispatch(action)
  }
}


