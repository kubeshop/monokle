/**
 * A file or folder in the file system.
 */

interface FileEntry {
  /** the name of the file */
  name: string;
  /** the path of the file relative to the root folder - used as key in the fileMap */
  filePath: string;
  /** if the file/folder is excluded from the navigator */
  isExcluded: boolean;
  /** child file names (for folders) */
  children?: string[];
  /** the timestamp of the last write - for discarding change notifications */
  timestamp?: number;
}

export type {FileEntry};
