/**
 * A file or folder in the file system.
 */

interface FileEntry {
  name: string; // the name of the file
  filePath: string; // the path of the file relative to the root folder - used as key in the fileMap
  excluded: boolean; // if the file/folder is excluded from the navigator
  children?: string[]; // child file names (for folders)
  timestamp?: number; // the timestamp of the last write - for discarding change notifications
}

export type {FileEntry};
