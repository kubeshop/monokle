import * as React from 'react';
import FolderTree from 'react-folder-tree';
import 'react-folder-tree/dist/style.css';
import { FileEntry } from '../../models/state';
import { useRef } from 'react';
import path from 'path';
import '../../styles/FileTreePane.css';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { selectFile, setRootFolder } from '../../redux/reducers/main';
import { Row } from 'react-bootstrap';
import { debugBorder } from '../../styles/DebugStyles';

interface TreeNode {
  name: string,
  checked: number,
  isOpen?: boolean,
  children: TreeNode[] | null
}

const mapTreeNodeFromFileEntry = (fileEntry: FileEntry): TreeNode => {
  const result: TreeNode = {
    name: fileEntry.name + (fileEntry.resourceIds ? ` [${fileEntry.resourceIds?.length}]` : ''),
    checked: fileEntry.selected ? 1 : 0,
    children: fileEntry.children ?
      fileEntry.children.map(child => mapTreeNodeFromFileEntry(child)) : null,
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
  var root = files[0];
  var topIndex = -1;

  for (var i = 1; i < files.length; i++) {
    // @ts-ignore
    var rootSegments = root.path.split(path.sep);
    // @ts-ignore
    var fileSegments = files[i].path.split(path.sep);

    var ix = 0;
    while (ix < rootSegments.length && ix < fileSegments.length && rootSegments[ix] === fileSegments[ix]) {
      ix++;
    }

    if (topIndex == -1 || ix < topIndex) {
      topIndex = ix;
      root = files[i];
    }
  }

  if (topIndex != -1) {
    // @ts-ignore
    return root.path.split(path.sep).slice(0, topIndex).join(path.sep);
  } else {
    // @ts-ignore
    return root.path;
  }
}

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
    dispatch(setRootFolder(folder, appConfig))
  }

  // eslint-disable-next-line no-unused-vars
  const onTreeStateChange = (state: any, event: any) => {
   // console.log('onTreeStateChange', state, event);
    //buildTreeData(state);
  }

  // custom event handler for node name click
  // @ts-ignore
  // eslint-disable-next-line no-unused-vars
  const onNameClick = ({ defaultOnClick, nodeData }) => {
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
    <div>
      <Row style={debugBorder}>
        <h4>File Explorer</h4>
      </Row>
      <input
        type='file'
        /* @ts-expect-error */
        directory=''
        webkitdirectory=''
        onChange={onUploadHandler}
        ref={folderInput}
      />
      <FolderTree
        readOnly={previewResource !== undefined}
        data={treeData}
        onChange={onTreeStateChange}
        onNameClick={onNameClick}
        initCheckedStatus='custom'  // default: 0 [unchecked]
        initOpenStatus='custom'  // default: 'open'
        indentPixels={8}
      />
    </div>
  );
};

export default FileTreePane;
