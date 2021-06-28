interface FileEntry {
  name: string; // the name of the file
  filePath: string; // the path of the file relative to the root folder - used as key in the fileMap
  highlight: boolean; // if the file should be highlighted in the UI
  selected: boolean; // if the file should be selected in the UI
  expanded: boolean; // if the file should be expanded (for folders only)
  excluded: boolean; // if the file/folder is excluded from the navigator
  children?: string[]; // child file names (for folders)
}

export type {FileEntry};
