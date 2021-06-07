interface FileEntry {
  name: string,
  folder: string,
  highlight: boolean,
  selected: boolean,
  expanded: boolean,
  excluded: boolean,
  children: FileEntry[],
}

type SetRootFolderAction = {
  type: string,
  rootFolder: string,
  appConfig: AppConfig,
  rootEntry?: FileEntry
}

type AppConfig = {
  scanExcludes: string[]
}

type AppState = {
  rootFolder: string,
  files: FileEntry[],
  statusText: string,
  appConfig: AppConfig
}

type SetRootFolderDispatchType = (args: SetRootFolderAction) => SetRootFolderAction

export type {FileEntry, AppState, SetRootFolderAction, SetRootFolderDispatchType, AppConfig}
