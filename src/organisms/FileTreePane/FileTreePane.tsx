import * as React from 'react';
import {FileEntry} from "../../models/state";
import {FC, useCallback, useRef} from "react";
import {useDispatch} from "react-redux";
import {setRootFolder} from "../../store/actionCreators";
import path from 'path';

interface FileTreeState {
  files: FileEntry[],
  rootFolder: string
}

const FileTreePane: FC<FileTreeState> = ({files, rootFolder}) => {
  const dispatch = useDispatch()

  // eslint-disable-next-line no-undef
  const folderInput = useRef<HTMLInputElement>(null);

  function onUploadHandler(e: any) {
    e.preventDefault();
    if (folderInput.current?.files && folderInput.current.files.length > 0) {
      // @ts-ignore
      setFolder(path.parse(folderInput.current.files[0].path).dir)
    }
  }

  const setFolder = useCallback(
    (folder: string) => {
      dispatch(setRootFolder(folder))
    }, [dispatch]
  )

  return (
    <div>
      <input
        type="file"
        /* @ts-expect-error */
        directory=""
        webkitdirectory=""
        onChange={onUploadHandler}
        ref={folderInput}
      />
      <h5>{rootFolder}</h5>
      {
        files.map(item => {
          return (
            <div key={item.name}>{item.name}</div>
          )
        })
      }
    </div>
  );
};

export default FileTreePane;
