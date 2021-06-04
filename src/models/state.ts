interface FileEntry {
  name: string,
  folder: string,
  highlight: boolean,
  selected: boolean,
  expanded: boolean,
  children: FileEntry[],
  resources: string[] // list of contained resource ids
}

type FileAction = {
  type: string
  file: FileEntry
}

type AppState = {
  rootFolder: string,
  files: FileEntry[]
}

type FileDispatchType = (args: FileAction) => FileAction

export type {FileEntry, AppState, FileAction, FileDispatchType}
