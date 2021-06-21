interface FileEntry {
  name: string,
  folder: string,
  highlight: boolean,
  selected: boolean,
  expanded: boolean,
  excluded: boolean,
  children?: FileEntry[],
  resourceIds?: string []
}

export type {
  FileEntry,
};
