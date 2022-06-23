/**
 * A file or folder in the file system.
 */

export interface MatchNode {
  textWithHighlights: string;
  lineNumber: number;
  start: number;
  end: number;
}

export interface CurrentMatch {
  matchesInFile: MatchNode[];
  currentMatchIdx: number;
}

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
  /** quantity of found matches for query */
  matchCount?: number;
  /** lines containing matches */
  matchLines?: MatchNode[][];
}

export type {FileEntry};
