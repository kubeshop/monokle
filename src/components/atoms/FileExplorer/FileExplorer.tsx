import React, {useRef, useEffect, useState, useCallback} from 'react';

type DirectoryOptions = {
  isDirectoryExplorer: true;
};

type FileOptions = {
  isDirectoryExplorer?: false;
  acceptedFileExtensions?: string[];
};

type FileExplorerOptions = DirectoryOptions | FileOptions;

export const useFileExplorer = (onFileSelect: (files: FileList) => void, options?: FileExplorerOptions) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onFileSelectHandler = useCallback(
    (files: FileList) => {
      onFileSelect(files);
      setIsOpen(false);
    },
    [onFileSelect]
  );

  return {
    openFileExplorer: () => {
      setIsOpen(true);
    },
    fileExplorerProps: {
      options,
      isOpen,
      onFileSelect: onFileSelectHandler,
      onOpen: () => {
        setIsOpen(false);
      },
    },
  };
};

type FileExplorerProps = {
  isOpen: boolean;
  onFileSelect: (files: FileList) => void;
  onOpen: () => void;
  options?: FileExplorerOptions;
};

const FileExplorer = (props: FileExplorerProps) => {
  const {isOpen, onFileSelect, onOpen, options} = props;
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fileInputRef && fileInputRef.current?.click();
      onOpen();
    }
  }, [isOpen]);

  const onChange = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
      onFileSelect(fileInputRef.current.files);
    }
  };

  const inputProps = {
    type: 'file',
    onChange,
    ref: fileInputRef,
    style: {display: 'none'},
  };

  if (options?.isDirectoryExplorer) {
    return (
      <input
        multiple
        /* @ts-expect-error */
        directory=""
        webkitdirectory=""
        {...inputProps}
      />
    );
  }

  const inputAccept = options?.acceptedFileExtensions?.length
    ? options.acceptedFileExtensions.map(ext => ext.trim()).join(',')
    : undefined;

  console.log({inputAccept});

  return <input accept={inputAccept} {...inputProps} />;
};

export default FileExplorer;
