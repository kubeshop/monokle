interface FileEntry {
  name: string;
  type: 'file';
  relPath: string;
  isExcluded: boolean;
  isDirty: boolean;
  text: string;
  timestamp?: number;
}

interface FolderEntry {
  name: string;
  type: 'folder';
  relPath: string;
  childrenEntryNames: string[];
  isExcluded: boolean;
}

interface RootEntry {
  name: string;
  type: 'root';
  absPath: string;
  childrenEntryNames: string[];
}

type FileSystemEntry = FolderEntry | FileEntry;
type RootOrFileSystemEntry = RootEntry | FileSystemEntry;
type FileSystemEntryMap = Record<string, FileSystemEntry>;

export function isFileEntry(fsEntry: FileSystemEntry): fsEntry is FileEntry {
  return fsEntry.type === 'file';
}

export function isFolderEntry(fsEntry: FileSystemEntry): fsEntry is FolderEntry {
  return fsEntry.type === 'folder';
}

export function isRootEntry(fsEntry: RootOrFileSystemEntry): fsEntry is RootEntry {
  return fsEntry.type === 'root';
}

export type {FileSystemEntryMap, RootOrFileSystemEntry, FileSystemEntry, RootEntry, FileEntry, FolderEntry};
