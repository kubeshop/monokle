import React, {useRef, useEffect} from 'react';

const FileExplorer = (props: {isOpen: boolean; onFileSelect: (files: FileList) => void}) => {
  const {isOpen, onFileSelect} = props;
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fileInputRef && fileInputRef.current?.click();
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
