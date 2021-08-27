import {useState, useCallback} from 'react';
import {FileExplorerOptions, FileExplorerProps} from '@atoms/FileExplorer';
import {findCommonRootFolder} from '@utils/files';

type FileExplorerSelectResult = {
  filePath?: string;
  filePaths?: string[];
  folderPath?: string;
};

export const useFileExplorer = (
  onSelect: (result: FileExplorerSelectResult) => void,
  options?: FileExplorerOptions
) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleOnSelect = useCallback(
    (fileList: FileList) => {
      setIsOpen(false);
      if (options?.isDirectoryExplorer) {
        onSelect({
          folderPath: findCommonRootFolder(fileList),
        });
        return;
      }
      if (options?.allowMultiple) {
        onSelect({
          filePaths: Array.from(fileList).map(f => f.path),
        });
        return;
      }
      onSelect({
        filePath: fileList[0].path,
      });
    },
    [setIsOpen, onSelect, options]
  );

  const handleOnOpen = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const openFileExplorer = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

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
