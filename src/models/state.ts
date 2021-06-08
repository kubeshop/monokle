interface FileEntry {
  name: string,
  folder: string,
  highlight: boolean,
  selected: boolean,
  expanded: boolean,
  excluded: boolean,
  parent?: FileEntry,
  children?: FileEntry[],
  resourceIds?: string []
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

type SelectKustomizationAction = {
  type: string,
  resourceIds: string[]
}

interface K8sResource {
  id: string,
  name: string,
  folder: string,
  file: string,
  kind: string,
  version: string,
  highlight: boolean,
  selected: boolean,
  content: any, // contains parsed yaml resource - used for filtering/etc
  refs?: ResourceRef[]
}

export enum ResourceRefType {
  KustomizationResource,
  KustomizationParent
}

export interface ResourceRef {
  targetResourceId: string,
  refType: ResourceRefType
}

interface NavigatorSubSection {
  name: string,
  kindSelector: string,
  apiVersionSelector: string
}

interface NavigatorSection {
  name: string,
  subsections: NavigatorSubSection[]
}

interface ObjectNavigator {
  name: string,
  sections: NavigatorSection[],
}

type AppConfig = {
  scanExcludes: string[],
  fileIncludes: string[],
  navigators: ObjectNavigator[]
}

type AppState = {
  rootFolder: string,
  files: FileEntry[],
  statusText: string,
  appConfig: AppConfig,
  resourceMap: Map<string, K8sResource>,
  fileMap: Map<string, FileEntry>
}

type SetRootFolderDispatchType = (args: SetRootFolderAction) => SetRootFolderAction
type SelectKustomizationDispatchType = (args: SelectKustomizationAction) => SelectKustomizationAction

export type {
  FileEntry, K8sResource, AppState, SetRootFolderAction, SelectKustomizationAction,
  SetRootFolderDispatchType,
  SelectKustomizationDispatchType, AppConfig
}
