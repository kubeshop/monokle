import * as React from 'react';
import {useRef} from 'react';
import styled from 'styled-components';
import path from 'path';
import {Row, Button, Tree, Col, Space, Typography} from 'antd';

import Colors, {FontColors, BackgroundColors} from '@styles/Colors';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile} from '@redux/reducers/main';
import {ROOT_FILE_ENTRY} from '@src/constants';

import {FolderAddOutlined, EyeInvisibleOutlined} from '@ant-design/icons';

import {FileEntry} from '@models/fileentry';
import {FileMapType, ResourceMapType} from '@models/appstate';
import fs from 'fs';
import {previewCluster, setRootFolder} from '@redux/reducers/thunks';
import {getResourcesForPath, getChildFilePath} from '@redux/utils/fileEntry';
import {MonoPaneTitle, MonoPaneTitleCol} from '@atoms';
import {useSelector} from 'react-redux';
import {inPreviewMode} from '@redux/selectors';

interface TreeNode {
  key: string;
  title: React.ReactNode;
  children: TreeNode[];
  highlight: boolean;
  isLeaf?: boolean;
}

const CenteredItemsDiv = styled.div`
  display: flex;
  align-items: center;
`;

const ColumnWithPadding = styled(Col)`
  padding: 16px 16px 0;
`;

const StyledNumberOfResources = styled(Typography.Text)`
  margin-left: 12px;
`;

const NodeContainer = styled.div`
  position: relative;
`;
const NodeTitleContainer = styled.div`
  padding-right: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const NodeActionsContainer = styled.div`
  position: absolute;
  right: 0;
  top: 0;
`;

const createNode = (fileEntry: FileEntry, fileMap: FileMapType, resourceMap: ResourceMapType) => {
  const resources = getResourcesForPath(fileEntry.filePath, resourceMap);

  const node: TreeNode = {
    key: fileEntry.filePath,
    title: (
      <NodeContainer>
        <NodeTitleContainer>
          {fileEntry.name}
          {resources.length > 0 ? (
            <StyledNumberOfResources type="secondary">{resources.length}</StyledNumberOfResources>
          ) : (
            ''
          )}
        </NodeTitleContainer>
        <NodeActionsContainer>{fileEntry.excluded && <EyeInvisibleOutlined />}</NodeActionsContainer>
      </NodeContainer>
    ),
    children: [],
    highlight: fileEntry.highlight,
  };

  if (fileEntry.children) {
    node.children = fileEntry.children
      .map(child => fileMap[getChildFilePath(child, fileEntry, fileMap)])
      .filter(childEntry => childEntry)
      .map(childEntry => createNode(childEntry, fileMap, resourceMap));
  } else {
    node.isLeaf = true;
  }

  return node;
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

  let result = topIndex !== -1 ? root.path.split(path.sep).slice(0, topIndex).join(path.sep) : root.path;

  // in some cases only a file is returned..
  if (fs.statSync(result).isFile()) {
    result = path.parse(result).dir;
  }

  return result;
}

const FileTreeContainer = styled.div`
  background: ${BackgroundColors.darkThemeBackground};
  width: 100%;
  height: 100%;

  & .ant-tree {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
      'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    font-variant: tabular-nums;
    font-size: 12px;
    font-style: normal;
    font-weight: normal;
    line-height: 22px;
    color: ${FontColors.darkThemeMainFont};
  }
  & .ant-tree-treenode-selected {
    background: ${Colors.selectionGradient} !important;
  }
  & .ant-tree-treenode-selected::before {
    background: ${Colors.selectionGradient} !important;
  }
  & .ant-tree-treenode {
    background: transparent;
  }
  & .ant-tree-treenode::selection {
    background: ${Colors.selectionGradient} !important;
  }
  & .filter-node {
    font-style: italic;
    font-weight: bold;
    background: ${Colors.highlightGradient};
    color: ${FontColors.resourceRowHighlight};
  }
  .ant-tree.ant-tree-directory .ant-tree-treenode .ant-tree-node-content-wrapper.ant-tree-node-selected {
    color: black !important;
    font-weight: bold;
  }
  & .ant-tree-iconEle {
    flex-shrink: 0;
  }
  & .ant-tree-iconEle .anticon {
    vertical-align: -2px;
  }
  & .ant-tree-node-content-wrapper {
    display: flex;
    overflow: hidden;
  }

  & .ant-tree-node-content-wrapper .ant-tree-title {
    overflow: hidden;
    flex-grow: 1;
  }
`;

const FileDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const NoFilesContainer = styled(Typography.Text)`
  margin-left: 16px;
`;

const FileTreePane = (props: {windowHeight: number | undefined}) => {
  const {windowHeight} = props;
  const dispatch = useAppDispatch();
  const previewResource = useAppSelector(state => state.main.previewResource);
  const previewMode = useSelector(inPreviewMode);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const previewType = useAppSelector(state => state.main.previewType);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const kubeconfig = useAppSelector(state => state.config.kubeconfig);
  const [tree, setTree] = React.useState<TreeNode | null>(null);

  // eslint-disable-next-line no-undef
  const folderInput = useRef<HTMLInputElement>(null);

  function onUploadHandler(e: React.SyntheticEvent) {
    e.preventDefault();
    if (folderInput.current?.files && folderInput.current.files.length > 0) {
      setFolder(findRootFolder(folderInput.current.files));
    }
  }

  const setFolder = (folder: string) => {
    dispatch(setRootFolder(folder));
  };

  React.useEffect(() => {
    const rootEntry = fileMap[ROOT_FILE_ENTRY];
    const treeData = rootEntry && createNode(rootEntry, fileMap, resourceMap);
    setTree(treeData);
  }, [fileMap, resourceMap]);

  const connectToCluster = () => {
    dispatch(previewCluster(kubeconfig));
  };

  const startFileUploader = () => {
    folderInput && folderInput.current?.click();
  };

  const onSelect = (selectedKeysValue: React.Key[], info: any) => {
    if (!previewMode && info.node.key) {
      dispatch(selectFile(info.node.key));
    }
  };

  const directoryPath = fileMap[ROOT_FILE_ENTRY] ? path.dirname(fileMap[ROOT_FILE_ENTRY].filePath) : '';
  // not counting the root
  const nrOfFiles = Object.keys(fileMap).length - 1;
  return (
    <FileTreeContainer>
      <Row>
        <MonoPaneTitleCol>
          <MonoPaneTitle>File Explorer</MonoPaneTitle>
        </MonoPaneTitleCol>
      </Row>
      <Row>
        <ColumnWithPadding span={24}>
          <Space direction="horizontal">
            <Button
              type="primary"
              ghost
              disabled={previewMode && previewResource !== kubeconfig}
              loading={previewType === 'cluster' && previewLoader.isLoading}
              onClick={connectToCluster}
            >
              Cluster Objects
            </Button>
            <Button type="primary" ghost onClick={startFileUploader}>
              <CenteredItemsDiv>
                <FolderAddOutlined style={{marginRight: '3px'}} />
                Browse
              </CenteredItemsDiv>
            </Button>
          </Space>
          <FileDetailsContainer>
            {nrOfFiles !== -1 && <Typography.Text type="secondary">{nrOfFiles} files</Typography.Text>}
          </FileDetailsContainer>
        </ColumnWithPadding>
      </Row>
      <input
        type="file"
        /* @ts-expect-error */
        directory=""
        webkitdirectory=""
        onChange={onUploadHandler}
        ref={folderInput}
        style={{display: 'none'}}
        disabled={previewMode}
      />
      {tree ? (
        <Tree.DirectoryTree
          // height is needed to enable Tree's virtual scroll
          height={windowHeight && windowHeight > 180 ? windowHeight - 180 : 0}
          onSelect={onSelect}
          defaultExpandAll
          treeData={[tree]}
          selectedKeys={[selectedPath || '-']}
          filterTreeNode={node => {
            // @ts-ignore
            return node.highlight;
          }}
          disabled={previewLoader.isLoading}
        />
      ) : (
        <NoFilesContainer>No folder selected.</NoFilesContainer>
      )}
    </FileTreeContainer>
  );
};

export default FileTreePane;
