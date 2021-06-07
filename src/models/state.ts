interface FileEntry {
  name: string,
  folder: string,
  highlight: boolean,
  selected: boolean,
  expanded: boolean,
  excluded: boolean,
  parent?: FileEntry,
  children?: FileEntry[],
  resources?: string []
}

type SetRootFolderAction = {
  type: string,
  rootFolder: string,
  appConfig: AppConfig,
  rootEntry?: FileEntry,
  resources: K8sResource [],
  resourceMap: Map<string,K8sResource>
}

interface K8sResource {
  id: string,
  name: string,
  folder: string,
  file: string,
  kind: string,
  version: string,
  highlight: boolean,
  content: any // contains parsed yaml resource - used for filtering/etc
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
  resourceMap: Map<string,K8sResource>
}

type SetRootFolderDispatchType = (args: SetRootFolderAction) => SetRootFolderAction

export type {FileEntry, K8sResource, AppState, SetRootFolderAction, SetRootFolderDispatchType, AppConfig}
