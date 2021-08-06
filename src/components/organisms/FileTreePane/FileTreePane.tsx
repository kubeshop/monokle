import * as React from 'react';
import {useEffect, useRef} from 'react';
import styled from 'styled-components';
import path from 'path';
import {Row, Button, Tree, Col, Space, Typography, Skeleton, Tooltip} from 'antd';

import Colors, {FontColors, BackgroundColors} from '@styles/Colors';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile, setSelectingFile} from '@redux/reducers/main';
import {ROOT_FILE_ENTRY, TOOLTIP_DELAY} from '@src/constants';

import {FolderAddOutlined} from '@ant-design/icons';

import {FileEntry} from '@models/fileentry';
import {FileMapType, ResourceMapType} from '@models/appstate';
import fs from 'fs';
import {stopPreview} from '@redux/services/preview';
import {getResourcesForPath, getChildFilePath} from '@redux/services/fileEntry';
import {MonoPaneTitle, MonoPaneTitleCol} from '@atoms';
import {useSelector} from 'react-redux';
import {inPreviewMode} from '@redux/selectors';
import {uniqueArr} from '@utils/index';
import {BrowseFolderTooltip} from '@src/tooltips';
import {setRootFolder} from '@redux/thunks/setRootFolder';

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
  color: ${Colors.blue10};
`;

const createNode = (fileEntry: FileEntry, fileMap: FileMapType, resourceMap: ResourceMapType) => {
  const resources = getResourcesForPath(fileEntry.filePath, resourceMap);

  const node: TreeNode = {
    key: fileEntry.filePath,
    title: (
      <NodeContainer>
        <NodeTitleContainer>
          <span className={fileEntry.excluded ? 'excluded-file-entry-name' : 'file-entry-name'}>{fileEntry.name}</span>
          {resources.length > 0 ? (
            <StyledNumberOfResources className="file-entry-nr-of-resources" type="secondary">
              {resources.length}
            </StyledNumberOfResources>
          ) : (
            ''
          )}
        </NodeTitleContainer>
      </NodeContainer>
    ),
    children: [],
    highlight: false,
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
  & .ant-tree-treenode {
    margin-left: 8px;
    background: transparent;
  }
  & .ant-tree-treenode-selected {
    vertical-align: center;
    margin-left: 0px !important;
    border-left: 8px hidden transparent;
    padding-left: 8px;
    padding-bottom: 2px;
    background: ${Colors.selectionGradient} !important;
  }
  & .ant-tree-treenode-selected::before {
    background: ${Colors.selectionGradient} !important;
  }
  & .ant-tree-treenode-selected .file-entry-name {
    color: ${Colors.blackPure} !important;
  }
  & .ant-tree-treenode-selected .ant-tree-switcher {
    color: ${Colors.blackPure} !important;
  }
  & .ant-tree-treenode-selected .file-entry-nr-of-resources {
    color: ${Colors.blackPure} !important;
  }
  & .ant-tree-treenode::selection {
    background: ${Colors.selectionGradient} !important;
  }
  & .filter-node {
    font-weight: bold;
    background: ${Colors.highlightGradient};
  }
  & .filter-node .file-entry-name {
    color: ${FontColors.resourceRowHighlight} !important;
  }
  .ant-tree.ant-tree-directory .ant-tree-treenode .ant-tree-node-content-wrapper.ant-tree-node-selected {
    color: ${Colors.blackPure} !important;
    font-weight: bold;
  }
  & .ant-tree-iconEle {
    flex-shrink: 0;
  }
  & .ant-tree-iconEle .anticon {
    vertical-align: text-bottom;
  }
  & .ant-tree-node-content-wrapper {
    display: flex;
    overflow: hidden;
  }

  & .ant-tree-node-content-wrapper .ant-tree-title {
    overflow: hidden;
    flex-grow: 1;
  }

  & .ant-tree-switcher {
    background: transparent;
  }

  & .excluded-file-entry-name {
    color: ${Colors.grey800};
  }
`;

const FileDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const NoFilesContainer = styled.div`
  margin-left: 16px;
  margin-top: 10px;
`;

const StyledTreeDirectoryTree = styled(Tree.DirectoryTree)`
  margin-left: 2px;
  margin-top: 10px;

  .ant-tree-switcher svg {
    color: ${props => (props.disabled ? `${Colors.grey800}` : 'inherit')} !important;
  }

  opacity: ${props => (props.disabled ? '70%' : '100%')};
`;

const DisabledDirectoryTree = styled(StyledTreeDirectoryTree)`
  opacity: 80%;
`;

const StyledSkeleton = styled(Skeleton)`
  margin: 20px;
  width: 90%;
`;

const FileTreePane = (props: {windowHeight: number | undefined}) => {
  const {windowHeight} = props;
  const dispatch = useAppDispatch();
  const previewMode = useSelector(inPreviewMode);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const uiState = useAppSelector(state => state.ui);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const isSelectingFile = useAppSelector(state => state.main.isSelectingFile);
  const shouldRefreshFileMap = useAppSelector(state => state.main.shouldRefreshFileMap);
  const [tree, setTree] = React.useState<TreeNode | null>(null);
  const [expandedKeys, setExpandedKeys] = React.useState<Array<React.Key>>([]);
  const [highlightNode, setHighlightNode] = React.useState<TreeNode>();
  const [autoExpandParent, setAutoExpandParent] = React.useState(true);
  const shouldExpandAllNodes = React.useRef(false);
  const treeRef = React.useRef<any>();

  // eslint-disable-next-line no-undef
  const folderInput = useRef<HTMLInputElement>(null);

  function onUploadHandler(e: React.SyntheticEvent) {
    e.preventDefault();
    if (folderInput.current?.files && folderInput.current.files.length > 0) {
      setFolder(findRootFolder(folderInput.current.files));
    }
    shouldExpandAllNodes.current = true;
    setAutoExpandParent(true);
  }

  const setFolder = (folder: string) => {
    dispatch(setRootFolder(folder));
  };

  const refreshFolder = () => {
    setFolder(fileMap[ROOT_FILE_ENTRY].filePath);
  };

  useEffect(() => {
    const rootEntry = fileMap[ROOT_FILE_ENTRY];
    const treeData = rootEntry && createNode(rootEntry, fileMap, resourceMap);

    setTree(treeData);

    if (shouldExpandAllNodes.current) {
      setExpandedKeys(Object.keys(fileMap).filter(key => fileMap[key]?.children?.length));
      shouldExpandAllNodes.current = false;
    }
  }, [fileMap]);

  /**
   * This useEffect ensures that the right treeNodes are expanded and highlighted
   * when a resource is selected
   */

  function highlightFilePath(filePath: string) {
    const paths = filePath.split(path.sep);
    const keys: Array<React.Key> = [];

    for (let c = 1; c < paths.length; c += 1) {
      keys.push(paths.slice(0, c + 1).join(path.sep));
    }

    let node: TreeNode | undefined = tree || undefined;
    for (let c = 0; c < keys.length && node; c += 1) {
      node = node.children.find(i => i.key === keys[c]);
    }

    if (node) {
      node.highlight = true;
      treeRef?.current?.scrollTo({key: node.key});

      if (highlightNode) {
        highlightNode.highlight = false;
      }
    }

    setHighlightNode(node);
    setExpandedKeys(prevExpandedKeys => uniqueArr([...prevExpandedKeys, ...Array.from(keys)]));
  }

  useEffect(() => {
    if (selectedResource && tree) {
      const resource = resourceMap[selectedResource];
      if (resource) {
        const filePath = resource.filePath;
        highlightFilePath(filePath);
      }
    }
  }, [selectedResource]);

  useEffect(() => {
    // removes any highlight when a file is selected
    if (selectedPath && highlightNode) {
      highlightNode.highlight = false;
    }
  }, [selectedPath]);

  const startFileUploader = () => {
    folderInput && folderInput.current?.click();
  };

  const onSelect = (selectedKeysValue: React.Key[], info: any) => {
    if (info.node.key) {
      if (previewMode) {
        stopPreview(dispatch);
      }
      dispatch(setSelectingFile(true));
      dispatch(selectFile(info.node.key));
    }
  };

  useEffect(() => {
    if (isSelectingFile) {
      dispatch(setSelectingFile(false));
    }
  }, [isSelectingFile]);

  const onExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

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
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={BrowseFolderTooltip}>
              <Button type="primary" ghost onClick={startFileUploader}>
                <CenteredItemsDiv>
                  <FolderAddOutlined style={{marginRight: '3px'}} />
                  Browse
                </CenteredItemsDiv>
              </Button>
            </Tooltip>
          </Space>
        </ColumnWithPadding>
        {shouldRefreshFileMap && fileMap[ROOT_FILE_ENTRY] && (
          <ColumnWithPadding span={24}>
            <Button type="primary" ghost onClick={refreshFolder}>
              Refresh Folder
            </Button>
          </ColumnWithPadding>
        )}
      </Row>

      <input
        type="file"
        /* @ts-expect-error */
        directory=""
        webkitdirectory=""
        onChange={onUploadHandler}
        ref={folderInput}
        style={{display: 'none'}}
      />
      {uiState.isFolderLoading ? (
        <StyledSkeleton active />
      ) : tree ? (
        <StyledTreeDirectoryTree
          // height is needed to enable Tree's virtual scroll
          height={windowHeight && windowHeight > 180 ? windowHeight - 180 : 0}
          onSelect={onSelect}
          treeData={[tree]}
          ref={treeRef}
          expandedKeys={expandedKeys}
          onExpand={onExpand}
          autoExpandParent={autoExpandParent}
          selectedKeys={[selectedPath || '-']}
          filterTreeNode={node => {
            // @ts-ignore
            return node.highlight;
          }}
          disabled={previewMode || previewLoader.isLoading}
          showLine
          showIcon={false}
        />
      ) : (
        <NoFilesContainer>
          Get started by selecting a folder containing manifests, kustomizations or Helm Charts.
        </NoFilesContainer>
      )}
    </FileTreeContainer>
  );
};

export default FileTreePane;
