import React, {useRef, useEffect} from 'react';

export type DirectoryOptions = {
  type: 'directory';
};

export type MultipleFilesOptions = {
  type: 'multiple-files';
  acceptedFileExtensions?: string[];
};

export type SingleFileOptions = {
  type: 'single-file';
  acceptedFileExtensions?: string[];
};

export type FileExplorerOptions = DirectoryOptions | MultipleFilesOptions | SingleFileOptions;

type FileExplorerProps = {
  isOpen: boolean;
  onSelect: (files: FileList) => void;
  onOpen: () => void;
  options: FileExplorerOptions;
};

const FileExplorer = (props: FileExplorerProps) => {
  const {isOpen, onSelect, onOpen, options} = props;
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
      onSelect(fileInputRef.current.files);
    }
  };

  const inputProps: React.HTMLProps<HTMLInputElement> = {
    type: 'file',
    onChange,
    ref: fileInputRef,
    style: {display: 'none'},
  };

  if (options.type === 'directory') {
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

  if (options.type === 'multiple-files') {
    inputProps.multiple = true;
  }

  const inputAccept = options?.acceptedFileExtensions?.length
    ? options.acceptedFileExtensions.map(ext => ext.trim()).join(',')
    : undefined;

  return <input accept={inputAccept} {...inputProps} />;
};

export default FileExplorer;
