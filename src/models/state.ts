interface FileEntry {
  name: string,
  folder: string,
  highlight: boolean,
  selected: boolean,
  expanded: boolean,
  children: FileEntry[],
}

type FileAction = {
  type: string,
  data: any
}

type AppState = {
  rootFolder: string,
  files: FileEntry[],
  statusText: string
}

type FileDispatchType = (args: FileAction) => FileAction

export type {FileEntry, AppState, FileAction, FileDispatchType}
