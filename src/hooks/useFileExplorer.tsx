import React, {useState, useCallback} from 'react';
import FileExplorer, {DirectoryOptions, MultipleFilesOptions, SingleFileOptions} from '@atoms/FileExplorer';
import {findCommonRootFolder} from '@utils/files';

type OnSelectDirectory = {
  type: 'directory';
  absolutePath: string;
};

type OnSelectMultipleFiles = {
  type: 'multiple-files';
  absolutePaths: string[];
};

type OnSelectSingleFile = {
  type: 'single-file';
  absolutePath: string;
};

interface UseDirectoryExplorerArgs extends DirectoryOptions {
  onSelect: (result: OnSelectDirectory) => void;
}

interface UseMultipleFileExplorerArgs extends MultipleFilesOptions {
  onSelect: (result: OnSelectMultipleFiles) => void;
}

interface UseSingleFileExplorerArgs extends SingleFileOptions {
  onSelect: (result: OnSelectSingleFile) => void;
}

function isUseDirectoryExplorer(x: UseFileExplorerArgs): x is UseDirectoryExplorerArgs {
  return x.type === 'directory';
}

function isUseMultipleFileExplorer(x: UseFileExplorerArgs): x is UseMultipleFileExplorerArgs {
  return x.type === 'multiple-files';
}

function isUseSingleFileExplorer(x: UseFileExplorerArgs): x is UseSingleFileExplorerArgs {
  return x.type === 'single-file';
}

type UseFileExplorerArgs = UseDirectoryExplorerArgs | UseMultipleFileExplorerArgs | UseSingleFileExplorerArgs;

export const useFileExplorer = (hookArgs: UseFileExplorerArgs) => {
  const {onSelect, ...options} = hookArgs;
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleOnSelect = useCallback(
    (fileList: FileList) => {
      setIsOpen(false);
      if (isUseDirectoryExplorer(hookArgs)) {
        hookArgs.onSelect({
          type: hookArgs.type,
          absolutePath: findCommonRootFolder(fileList),
        });
        return;
      }
      if (isUseMultipleFileExplorer(hookArgs)) {
        hookArgs.onSelect({
          type: hookArgs.type,
          absolutePaths: Array.from(fileList).map(f => f.path),
        });
        return;
      }
      if (isUseSingleFileExplorer(hookArgs)) {
        hookArgs.onSelect({
          type: hookArgs.type,
          absolutePath: fileList[0].path,
        });
      }
    },
    [onSelect, setIsOpen]
  );

  const handleOnOpen = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const openFileExplorer = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const getFileExplorer = useCallback(() => {
    return <FileExplorer options={options} isOpen={isOpen} onSelect={handleOnSelect} onOpen={handleOnOpen} />;
  }, [options, isOpen, handleOnSelect, handleOnOpen]);

  return {
    openFileExplorer,
    FileExplorer: getFileExplorer,
  };
};
