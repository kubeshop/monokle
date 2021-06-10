import {SELECT_K8SRESOURCE, SELECT_KUSTOMIZATION, SET_FILTER_OBJECTS, SET_ROOT_FOLDER} from "./actionTypes";
import {AppState} from "../models/state";
import path from "path";
import {AnyAction} from "redux";
import {initialState} from "./initialState";
import {selectResourceFileEntry} from "./utils/fileEntry";

const mainReducer = (
  state: AppState = initialState,
  action: AnyAction
): AppState => {
  switch (action.type) {
    case SET_FILTER_OBJECTS:
      return {
        ...state,
        appConfig: {
          ...state.appConfig,
          settings: {
            ...state.appConfig.settings,
            filterObjectsOnSelection: action.filterObjectsOnSelection
          }
        }
      }
    case SET_ROOT_FOLDER:
      if (action.rootEntry) {
        var rootFolder = path.join(action.rootEntry.folder, action.rootEntry.name);
        return {
          ...state,
          rootFolder: rootFolder,
          statusText: "Loaded folder " + rootFolder,
          fileMap: action.fileMap,
          resourceMap: action.resourceMap,

          files: action.rootEntry.children ? action.rootEntry.children : []
        }
      }
      break
    case SELECT_K8SRESOURCE:
      if (action.linkedResourceIds && action.resourceId) {
        const resource = state.resourceMap.get(action.resourceId)
        if (resource) {
          selectResourceFileEntry(resource)
        }

        action.linkedResourceIds.forEach((e: string) => {
          const resource = state.resourceMap.get(e)
          if (resource) {
            resource.highlight = true
          }
        })
      }
      return {
        ...state,
        resourceMap: state.resourceMap,
        files: state.files
      }
    case SELECT_KUSTOMIZATION:
      if (action.linkedResourceIds && action.kustomizationResourceId) {
        const resource = state.resourceMap.get(action.kustomizationResourceId)
        if (resource) {
          selectResourceFileEntry(resource)
        }

        action.linkedResourceIds.forEach((e: string) => {
          const resource = state.resourceMap.get(e)
          if (resource) {
            resource.highlight = true
          }
        })
      }
      return {
        ...state,
        resourceMap: state.resourceMap,
        files: state.files
      }
  }
  return state
}

export default mainReducer
