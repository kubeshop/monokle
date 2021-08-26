import React, {useRef, useEffect, useState, useCallback} from 'react';

export const useFileExplorer = (onFileSelect: (files: FileList) => void) => {
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
      isOpen,
      onFileSelect: onFileSelectHandler,
      onOpen: () => {
        setIsOpen(false);
      },
    },
  };
};

type FileExplorerProps = {isOpen: boolean; onFileSelect: (files: FileList) => void; onOpen: () => void};

const FileExplorer = (props: FileExplorerProps) => {
  const {isOpen, onFileSelect, onOpen} = props;
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

  return (
    <input
      type="file"
      /* @ts-expect-error */
      directory=""
      webkitdirectory=""
      onChange={onChange}
      ref={fileInputRef}
      style={{display: 'none'}}
    />
  );
};

export default FileExplorer;
