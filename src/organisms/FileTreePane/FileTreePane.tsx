import * as React from 'react';
import FolderTree from 'react-folder-tree';
import 'react-folder-tree/dist/style.css';
import {AppConfig, FileEntry} from "../../models/state";
import {FC, useCallback, useRef} from "react";
import {useDispatch} from "react-redux";
import {setRootFolder} from "../../store/actionCreators";
import path from 'path';
import "../../styles/FileTreePane.css"

interface FileTreeState {
  files: FileEntry[],
  rootFolder: string,
  appConfig: AppConfig
}

interface TreeNode {
  name: string,
  checked: number,
  isOpen: boolean,
  children: TreeNode[] | null
}

const mapTreeNodeFromFileEntry= (fileEntry: FileEntry) : TreeNode => {
  const children: TreeNode[] | null = fileEntry.children ? fileEntry.children.map( child => mapTreeNodeFromFileEntry(child)) : []
  return {
    name: fileEntry.name,
    checked: fileEntry.selected ? 1 : 0,
    isOpen: fileEntry.expanded,
    children: children
  }
}

const buildTreeData = (fileEntry: FileEntry): TreeNode => {
  console.log("buildTreeData");
  console.log(fileEntry);

  const data: TreeNode = mapTreeNodeFromFileEntry(fileEntry);

  console.log("data:\n", data);
  return data;
}

const FileTreePane: FC<FileTreeState> = ({files, rootFolder, appConfig}) => {
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
      dispatch(setRootFolder(folder, appConfig))
    }, [dispatch]
  )

  const onTreeStateChange = (state: any, event: any) => {
    console.log("onTreeStateChange", state, event);
    //buildTreeData(state);
  }

  const treeData : TreeNode = buildTreeData({
    name: rootFolder,
    folder: '',
    highlight: false,
    selected: false,
    expanded: true,
    excluded: false,
    children: files
  });

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
      <FolderTree
        data={ treeData }
        onChange={ onTreeStateChange }
      />
    </div>
  );
};

export default FileTreePane;
