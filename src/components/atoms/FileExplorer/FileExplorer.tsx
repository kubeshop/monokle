import {ipcRenderer} from 'electron';

import {useEffect} from 'react';

export type DirectoryOptions = {
  isDirectoryExplorer: true;
  defaultPath?: string;
};

export type FileOptions = {
  isDirectoryExplorer?: false;
  allowMultiple?: boolean;
  acceptedFileExtensions?: string[];
  defaultPath?: string;
};

export type FileExplorerOptions = DirectoryOptions | FileOptions;

export type FileExplorerProps = {
  isOpen: boolean;
  onSelect: (files: string[]) => void;
  onOpen: () => void;
  options?: FileExplorerOptions;
};

const FileExplorer = (props: FileExplorerProps) => {
  const {isOpen, onSelect, onOpen, options} = props;

  useEffect(() => {
    if (isOpen) {
      onOpen();
      ipcRenderer.invoke('select-file', options).then(files => {
        if (files) {
          onSelect(files);
        }
      });
    }
  }, [isOpen, options, onOpen, onSelect]);

  return null;
};

export default FileExplorer;
