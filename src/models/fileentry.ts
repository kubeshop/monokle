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
  /** if the file is found in global inclusion config ( config.fileIncludes ) */
  isSupported: boolean;
  /** child file names (for folders) */
  children?: string[];
  /** the timestamp of the last write - for discarding change notifications */
  timestamp?: number;
  /** the id of the helm chart this file might belong to */
  helmChartId?: string;
  /** file content */
  text?: string;
}

export type {FileEntry};
