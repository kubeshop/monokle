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

interface K8sResource {
  id: string,
  name: string,
  fileEntry: FileEntry,
  kind: string,
  version: string,
  highlight: boolean,
  selected: boolean,
  content: any, // contains parsed yaml resource - used for filtering/etc
  refs?: ResourceRef[]
}

export enum ResourceRefType {
  KustomizationResource,
  KustomizationParent,
  ServicePodSelector
}

interface ResourceRef {
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
  navigators: ObjectNavigator[],
  settings: {
    filterObjectsOnSelection: boolean
  }
}

type AppState = {
  rootFolder: string,
  files: FileEntry[],
  statusText: string,
  appConfig: AppConfig,
  resourceMap: Map<string, K8sResource>,
  fileMap: Map<string, FileEntry>
}

export type {
  FileEntry, K8sResource, AppState, AppConfig, ResourceRef
}
