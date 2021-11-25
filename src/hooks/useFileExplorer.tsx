import {useCallback, useState} from 'react';

import {useAppSelector} from '@redux/hooks';
import {getRootFolder} from '@redux/services/fileEntry';

import {FileExplorerOptions, FileExplorerProps} from '@atoms/FileExplorer';

type FileExplorerSelectResult = {
  existingFilePath?: string;
  filePaths?: string[];
  newFilePath?: string;
};

export const useFileExplorer = (onSelect: (result: FileExplorerSelectResult) => void, options: FileExplorerOptions) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const fileMap = useAppSelector(state => state.main.fileMap);

  const handleOnSelect = useCallback(
    (fileList: string[]) => {
      setIsOpen(false);
      if (options?.isDirectoryExplorer) {
        onSelect({
          newFilePath: fileList[0],
        });
        return;
      }
      if (options?.allowMultiple) {
        onSelect({
          filePaths: fileList,
        });
        return;
      }
      if (options?.action === 'save') {
        onSelect({
          newFilePath: fileList[0],
        });
      } else {
        onSelect({
          existingFilePath: fileList[0],
        });
      }
    },
    [setIsOpen, onSelect, options]
  );

  const handleOnOpen = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const openFileExplorer = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  if (!options.defaultPath) {
    options.defaultPath = getRootFolder(fileMap);
  }

  const fileExplorerProps: FileExplorerProps = {
    options,
    isOpen,
    onSelect: handleOnSelect,
    onOpen: handleOnOpen,
  };

  return {
    openFileExplorer,
    fileExplorerProps,
  };
};
