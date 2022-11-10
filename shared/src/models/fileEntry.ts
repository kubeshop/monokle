/**
 * A file or folder in the file system.
 */

type MatchNode = {
  lineNumber: number;
  start: number;
  end: number;
  currentMatchNumber: number;
  wholeLine: string;
  matchesInLine: string[];
};

type CurrentMatch = {
  matchesInFile: MatchNode[];
  currentMatchIdx: number;
  replaceWith?: string;
};

type FileEntry = {
  /** the name of the file */
  name: string;
  /** the path of the file relative to the root folder - used as key in the fileMap */
  filePath: string;
  /** file extension */
  extension: string;
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
};

export type {CurrentMatch, FileEntry, MatchNode};
