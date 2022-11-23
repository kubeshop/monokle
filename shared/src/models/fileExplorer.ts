export type DirectoryOptions = {
  isDirectoryExplorer: true;
  defaultPath?: string;
  title?: string;
};

export type FileOptions = {
  isDirectoryExplorer?: false;
  allowMultiple?: boolean;
  acceptedFileExtensions?: string[];
  defaultPath?: string;
  title?: string;
  action?: 'save' | 'open';
};

export type FileExplorerOptions = DirectoryOptions | FileOptions;
