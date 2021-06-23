import * as React from 'react';
import FolderTree from 'react-folder-tree';
import {Row} from 'react-bootstrap';
import 'react-folder-tree/dist/style.css';
import {useRef} from 'react';
import styled from 'styled-components';
import path from 'path';

import '@styles/FileTreePane.css';
import {appColors as colors} from '@styles/AppColors';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile, setRootFolder} from '@redux/reducers/main';
import {FileEntry} from '@models/fileentry';

interface TreeNode {
  name: string;
  checked: number;
  isOpen?: boolean;
  children: TreeNode[] | null;
}

const mapTreeNodeFromFileEntry = (fileEntry: FileEntry): TreeNode => {
  const result: TreeNode = {
    name: fileEntry.name + (fileEntry.resourceIds ? ` [${fileEntry.resourceIds?.length}]` : ''),
    checked: fileEntry.selected ? 1 : 0,
    children: fileEntry.children ? fileEntry.children.map(child => mapTreeNodeFromFileEntry(child)) : null,
  };

  if (fileEntry.children) {
    result.isOpen = fileEntry.expanded;
  }

  return result;
};

// algorithm to find common root folder for selected files - since the first entry is not
// necessarily the selected folder
// eslint-disable-next-line no-undef
function findRootFolder(files: FileList) {
  let root: any = files[0];
  let topIndex = -1;

  for (let i = 1; i < files.length; i += 1) {
    let rootSegments = root.path.split(path.sep);
    // @ts-ignore
    let fileSegments = files[i].path.split(path.sep);

    let ix = 0;
    while (ix < rootSegments.length && ix < fileSegments.length && rootSegments[ix] === fileSegments[ix]) {
      ix += 1;
    }

    if (topIndex === -1 || ix < topIndex) {
      topIndex = ix;
      root = files[i];
    }
  }

  if (topIndex !== -1) {
    return root.path.split(path.sep).slice(0, topIndex).join(path.sep);
  }

  return root.path;
}

const FileTreeContainer = styled.div`
  background: ${colors.appNormalBackgroound};
  width: 100%;
  height: 100%;
`;

const TitleRow = styled(Row)`
  border: 1px solid blue;
  border-radius: 2px;
  background: ${colors.appNormalBackgroound};
  width: 100%;
  margin: 0;
`;

const Title = styled.h4`
  font-size: 1.5em;
  text-align: center;
  color: tomato;
`;

const FileTreePane = () => {
  const dispatch = useAppDispatch();

  const rootFolder = useAppSelector(state => state.main.rootFolder);
  const appConfig = useAppSelector(state => state.config);
  const previewResource = useAppSelector(state => state.main.previewResource);
  const files = useAppSelector(state => state.main.rootEntry?.children);

  // eslint-disable-next-line no-undef
  const folderInput = useRef<HTMLInputElement>(null);

  function onUploadHandler(e: any) {
    e.preventDefault();
    if (folderInput.current?.files && folderInput.current.files.length > 0) {
      setFolder(findRootFolder(folderInput.current.files));
    }
  }

  const setFolder = (folder: string) => {
    dispatch(setRootFolder(folder, appConfig));
  };

  // eslint-disable-next-line no-unused-vars
  const onTreeStateChange = (state: any, event: any) => {
    // console.log('onTreeStateChange', state, event);
    // buildTreeData(state);
  };

  // custom event handler for node name click
  // @ts-ignore
  // eslint-disable-next-line no-unused-vars
  const onNameClick = ({defaultOnClick, nodeData}) => {
    if (previewResource === undefined) {
      dispatch(selectFile(nodeData.path));
    }
  };

  const treeData: TreeNode = mapTreeNodeFromFileEntry({
    name: rootFolder,
    folder: '',
    highlight: false,
    selected: false,
    expanded: true,
    excluded: false,
    children: files,
  });

  return (
    <FileTreeContainer>
      <TitleRow>
        <Title>File Explorer</Title>
      </TitleRow>
      <input
        type="file"
        /* @ts-expect-error */
        directory=""
        webkitdirectory=""
        onChange={onUploadHandler}
        ref={folderInput}
      />
      <FolderTree
        readOnly={previewResource !== undefined}
        data={treeData}
        onChange={onTreeStateChange}
        onNameClick={onNameClick}
        initCheckedStatus="custom" // default: 0 [unchecked]
        initOpenStatus="custom" // default: 'open'
        indentPixels={8}
      />
    </FileTreeContainer>
  );
};

export default FileTreePane;
