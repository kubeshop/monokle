/**
 * A file or folder in the file system.
 */
type FileEntry = {
  /** the name of the file */
  name: string;
  /** the path of the file relative to the root folder - used as key in the fileMap */
  filePath: string;
  rootFolderPath: string;
  /** file extension */
  extension: string;
  /** if the file/folder is excluded from the navigator */
  isExcluded: boolean;
  /** if the file is found in global inclusion config ( config.fileIncludes ) which means this file might contain k8s resources */
  containsK8sResources?: boolean;
  /** child file names (for folders) */
  children?: string[];
  /** the timestamp of the last write - for discarding change notifications */
  timestamp?: number;
  /** the id of the helm chart this file might belong to */
  helmChartId?: string;
};

type FileSideEffect = {
  affectedResourceIds: string[];
};

export type {FileEntry, FileSideEffect};
