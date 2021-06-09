import {AppConfig, FileEntry, K8sResource} from "../models/state";

export const SET_ROOT_FOLDER = "SET_ROOT_FOLDER"
export const SELECT_KUSTOMIZATION = "SELECT_KUSTOMIZATION"
export const SET_FILTER_OBJECTS = "SET_FILTER_OBJECTS"

type SelectKustomizationAction = {
  type: string,
  resourceIds: string[]
}

type SetRootFolderAction = {
  type: string,
  rootFolder: string,
  appConfig: AppConfig,
  rootEntry?: FileEntry,
  resources: K8sResource [],
  resourceMap: Map<string, K8sResource>,
  fileMap: Map<string, FileEntry>
}

type SetFilterObjectsAction = {
  type: string,
  filterObjectsOnSelection: boolean
}

type SetRootFolderDispatchType = (args: SetRootFolderAction) => SetRootFolderAction
type SelectKustomizationDispatchType = (args: SelectKustomizationAction) => SelectKustomizationAction
type SetFilterObjectsDispatchType = (args: SetFilterObjectsAction) => SetFilterObjectsAction

export type {
  SetRootFolderAction,
  SelectKustomizationAction,
  SetRootFolderDispatchType,
  SelectKustomizationDispatchType,
  SetFilterObjectsAction,
  SetFilterObjectsDispatchType
}
