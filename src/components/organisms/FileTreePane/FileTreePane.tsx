import {ipcRenderer} from 'electron';

import React, {Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useSelector} from 'react-redux';

import {Button, Menu, Modal, Row, Skeleton, Tooltip, Tree, Typography} from 'antd';

import {ExclamationCircleOutlined, FolderAddOutlined, ReloadOutlined} from '@ant-design/icons';

import micromatch from 'micromatch';
import path from 'path';
import styled from 'styled-components';

import {FILE_TREE_HEIGHT_OFFSET, ROOT_FILE_ENTRY, TOOLTIP_DELAY} from '@constants/constants';
import {BrowseFolderTooltip, FileExplorerChanged, ReloadFolderTooltip, ToggleTreeTooltip} from '@constants/tooltips';

import {AlertEnum} from '@models/alert';
import {FileMapType, ResourceMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {setScanExcludesStatus, updateScanExcludes} from '@redux/reducers/appConfig';
import {selectFile, setSelectingFile} from '@redux/reducers/main';
import {
  closeFolderExplorer,
  openCreateFolderModal,
  openNewResourceWizard,
  openRenameEntityModal,
  setShouldExpandAllNodes,
} from '@redux/reducers/ui';
import {isInPreviewModeSelector} from '@redux/selectors';
import {getChildFilePath, getResourcesForPath} from '@redux/services/fileEntry';
import {stopPreview} from '@redux/services/preview';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {MonoPaneTitle, MonoPaneTitleCol, Spinner} from '@atoms';
import FileExplorer from '@atoms/FileExplorer';

import Dots from '@components/atoms/Dots';
import Icon from '@components/atoms/Icon';
import ContextMenu from '@components/molecules/ContextMenu';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {DeleteEntityCallback, deleteEntity, getFileStats} from '@utils/files';
import {uniqueArr} from '@utils/index';
import {showItemInFolder} from '@utils/shell';

import Colors, {BackgroundColors, FontColors} from '@styles/Colors';

import AppContext from '@src/AppContext';

interface TreeNode {
  key: string;
  title: React.ReactNode;
  children: TreeNode[];
  highlight: boolean;
  isFolder?: boolean;
  /**
   * Whether the TreeNode has children
   */
  isLeaf?: boolean;
  icon?: React.ReactNode;
  isExcluded?: boolean;
}

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

const createNode = (
  fileEntry: FileEntry,
  fileMap: FileMapType,
  resourceMap: ResourceMapType,
  hideExcludedFilesInFileExplorer: boolean
): TreeNode => {
  const resources = getResourcesForPath(fileEntry.filePath, resourceMap);

  const node: TreeNode = {
    key: fileEntry.filePath,
    title: (
      <NodeContainer>
        <NodeTitleContainer>
          <span className={fileEntry.isExcluded ? 'excluded-file-entry-name' : 'file-entry-name'}>
            {fileEntry.name}
          </span>
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
    isExcluded: fileEntry.isExcluded,
  };

  if (fileEntry.children) {
    if (fileEntry.children.length) {
      node.children = fileEntry.children
        .map(child => fileMap[getChildFilePath(child, fileEntry, fileMap)])
        .filter(childEntry => childEntry)
        .map(childEntry => createNode(childEntry, fileMap, resourceMap, hideExcludedFilesInFileExplorer))
        .filter(childEntry => {
          if (!hideExcludedFilesInFileExplorer) {
            return childEntry;
          }

          return !childEntry.isExcluded;
        });
    }
    node.isFolder = true;
  } else {
    node.isLeaf = true;
  }

  return node;
};

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
    padding-bottom: 0px;
    background: ${Colors.selectionGradient} !important;
  }
  & .ant-tree-treenode-selected::before {
    background: ${Colors.selectionGradient} !important;
  }
  & .file-entry-name {
    color: ${Colors.blue10};
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

const TitleBarContainer = styled.div`
  display: flex;
  height: 24px;
  justify-content: space-between;
`;

const Title = styled.span`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding-right: 10px;
`;

const RightButtons = styled.div`
  display: flex;
  align-items: center;

  button:not(:last-child),
  .ant-tooltip-disabled-compatible-wrapper:not(:last-child) {
    margin-right: 10px;
  }

  .ant-tooltip-disabled-compatible-wrapper {
    margin-bottom: 1px;
  }
`;

const TreeTitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  height: 100%;

  & .ant-dropdown-trigger {
    height: inherit;
    margin-right: 10px;
  }
`;

const TreeTitleText = styled.span`
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const StyledSkeleton = styled(Skeleton)`
  margin: 20px;
  width: 90%;
`;

const ReloadButton = styled(Button)``;

const BrowseButton = styled(Button)``;

const SpinnerWrapper = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 100%;

  @supports (backdrop-filter: blur(10px)) or (--webkit-backdrop-filter: blur(10px)) {
    backdrop-filter: blur(5px);
    --webkit-backdrop-filter: blur(5px);
  }
`;

const ContextMenuDivider = styled.div`
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
`;
interface ProcessingEntity {
  processingEntityID?: string;
  processingType?: 'delete' | 'rename';
}

interface TreeItemProps {
  title: React.ReactNode;
  treeKey: string;
  setProcessingEntity: Dispatch<SetStateAction<ProcessingEntity>>;
  processingEntity: ProcessingEntity;
  onDelete: (args: DeleteEntityCallback) => void;
  onRename: (absolutePath: string, osPlatform: NodeJS.Platform) => void;
  onExcludeFromProcessing: (relativePath: string) => void;
  onIncludeToProcessing: (relativePath: string) => void;
  onCreateFolder: (absolutePath: string) => void;
  onCreateResource: (params: {targetFolder?: string; targetFile?: string}) => void;
  isExcluded?: Boolean;
  isFolder?: Boolean;
}

function deleteEntityWizard(entityInfo: {entityAbsolutePath: string}, onOk: () => void, onCancel: () => void) {
  const title = `Are you sure you want to delete "${path.basename(entityInfo.entityAbsolutePath)}"?`;

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    onOk() {
      onOk();
    },
    onCancel() {
      onCancel();
    },
  });
}

const TreeItem: React.FC<TreeItemProps> = props => {
  const {
    title,
    treeKey,
    isExcluded,
    setProcessingEntity,
    processingEntity,
    onDelete,
    onRename,
    onExcludeFromProcessing,
    onIncludeToProcessing,
    onCreateFolder,
    onCreateResource,
    isFolder,
  } = props;

  const fileMap = useAppSelector(state => state.main.fileMap);
  const osPlatform = useAppSelector(state => state.config.osPlatform);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const [isTitleHovered, setTitleHoverState] = useState(false);

  const isFileSelected = useMemo(() => {
    return treeKey === selectedPath;
  }, [treeKey, selectedPath]);

  const getBasename = osPlatform === 'win32' ? path.win32.basename : path.basename;

  const isRoot = fileMap[ROOT_FILE_ENTRY].filePath === treeKey;
  const relativePath = isRoot ? getBasename(path.normalize(treeKey)) : treeKey;
  const absolutePath = isRoot
    ? fileMap[ROOT_FILE_ENTRY].filePath
    : path.join(fileMap[ROOT_FILE_ENTRY].filePath, treeKey);

  const target = isRoot ? ROOT_FILE_ENTRY : treeKey.replace(path.sep, '');

  const platformFilemanagerNames: {[name: string]: string} = {
    darwin: 'Finder',
  };

  const platformFilemanagerName = platformFilemanagerNames[osPlatform] || 'Explorer';

  const menu = (
    <Menu>
      {isFolder ? (
        <>
          <Menu.Item
            onClick={e => {
              e.domEvent.stopPropagation();

              onCreateFolder(absolutePath);
            }}
            key="create_directory"
          >
            New Folder
          </Menu.Item>
        </>
      ) : null}
      <Menu.Item
        onClick={e => {
          e.domEvent.stopPropagation();

          showItemInFolder(absolutePath);
        }}
        key="reveal_in_finder"
      >
        Reveal in {platformFilemanagerName}
      </Menu.Item>
      <ContextMenuDivider />
      <Menu.Item
        onClick={e => {
          e.domEvent.stopPropagation();

          onCreateResource(isFolder ? {targetFolder: target} : {targetFile: target});
        }}
        key="create_resource"
      >
        New Resource
      </Menu.Item>
      <ContextMenuDivider />
      <Menu.Item
        onClick={e => {
          e.domEvent.stopPropagation();

          navigator.clipboard.writeText(absolutePath);
        }}
        key="copy_full_path"
      >
        Copy Path
      </Menu.Item>
      <Menu.Item
        onClick={e => {
          e.domEvent.stopPropagation();

          navigator.clipboard.writeText(relativePath);
        }}
        key="copy_relative_path"
      >
        Copy Relative Path
      </Menu.Item>
      {fileMap[ROOT_FILE_ENTRY].filePath !== treeKey ? (
        <>
          <Menu.Item
            onClick={e => {
              e.domEvent.stopPropagation();
              if (isExcluded) {
                onIncludeToProcessing(relativePath);
              } else {
                onExcludeFromProcessing(relativePath);
              }
            }}
            key="add_to_files_exclude"
          >
            {isExcluded ? 'Remove from' : 'Add to'} Files: Exclude
          </Menu.Item>
          <ContextMenuDivider />
          <Menu.Item
            onClick={e => {
              e.domEvent.stopPropagation();

              onRename(absolutePath, osPlatform);
            }}
            key="rename_entity"
          >
            Rename
          </Menu.Item>
          <Menu.Item
            key="delete_entity"
            onClick={e => {
              e.domEvent.stopPropagation();

              deleteEntityWizard(
                {entityAbsolutePath: absolutePath},
                () => {
                  setProcessingEntity({processingEntityID: treeKey, processingType: 'delete'});
                  deleteEntity(absolutePath, onDelete);
                },
                () => {}
              );
            }}
          >
            Delete
          </Menu.Item>
        </>
      ) : null}
    </Menu>
  );

  return (
    <TreeTitleWrapper
      onMouseEnter={() => {
        setTitleHoverState(true);
      }}
      onMouseLeave={() => {
        setTitleHoverState(false);
      }}
    >
      <TreeTitleText>{title}</TreeTitleText>
      {processingEntity.processingEntityID === treeKey && processingEntity.processingType === 'delete' ? (
        <SpinnerWrapper>
          <Spinner />
        </SpinnerWrapper>
      ) : null}
      {isTitleHovered && !processingEntity.processingType ? (
        <ContextMenu overlay={menu}>
          <div
            onClick={e => {
              e.stopPropagation();
            }}
          >
            <Dots color={isFileSelected ? Colors.blackPure : undefined} />
          </div>
        </ContextMenu>
      ) : null}
    </TreeTitleWrapper>
  );
};

const FileTreePane = () => {
  const {windowSize} = useContext(AppContext);
  const windowHeight = windowSize.height;

  const dispatch = useAppDispatch();

  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const uiState = useAppSelector(state => state.ui);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const isSelectingFile = useAppSelector(state => state.main.isSelectingFile);
  const hideExcludedFilesInFileExplorer = useAppSelector(
    state => state.config.settings.hideExcludedFilesInFileExplorer
  );
  const loadLastFolderOnStartup = useAppSelector(state => state.config.settings.loadLastFolderOnStartup);
  const recentFolders = useAppSelector(state => state.config.recentFolders);
  const fileIncludes = useAppSelector(state => state.config.fileIncludes);
  const scanExcludes = useAppSelector(state => state.config.scanExcludes);
  const isScanExcludesUpdated = useAppSelector(state => state.config.isScanExcludesUpdated);
  const shouldExpandAllNodes = useAppSelector(state => state.ui.shouldExpandAllNodes);
  const excludedFromScanFiles = useAppSelector(state => state.config.scanExcludes);
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<Array<React.Key>>([]);
  const [highlightNode, setHighlightNode] = useState<TreeNode>();
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const treeRef = useRef<any>();
  const [processingEntity, setProcessingEntity] = useState<ProcessingEntity>({
    processingEntityID: undefined,
    processingType: undefined,
  });

  const isButtonDisabled = !fileMap[ROOT_FILE_ENTRY];

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (folderPath) {
        setFolder(folderPath);
      }
      setAutoExpandParent(true);
    },
    {isDirectoryExplorer: true}
  );

  const setFolder = useCallback(
    (folder: string) => {
      dispatch(setScanExcludesStatus('applied'));
      dispatch(setRootFolder(folder));
    },
    [dispatch]
  );

  const refreshFolder = useCallback(() => {
    setFolder(fileMap[ROOT_FILE_ENTRY].filePath);
  }, [fileMap, setFolder]);

  useEffect(() => {
    const rootEntry = fileMap[ROOT_FILE_ENTRY];
    const treeData = rootEntry && createNode(rootEntry, fileMap, resourceMap, hideExcludedFilesInFileExplorer);

    setTree(treeData);

    if (shouldExpandAllNodes) {
      setExpandedKeys(Object.keys(fileMap).filter(key => fileMap[key]?.children?.length));
      dispatch(setShouldExpandAllNodes(false));
    }
  }, [resourceMap, fileMap, shouldExpandAllNodes, hideExcludedFilesInFileExplorer, dispatch]);

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
    if (selectedResourceId && tree) {
      const resource = resourceMap[selectedResourceId];
      if (resource) {
        const filePath = resource.filePath;
        highlightFilePath(filePath);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResourceId, tree]);

  useEffect(() => {
    // removes any highlight when a file is selected
    if (selectedPath && highlightNode) {
      highlightNode.highlight = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPath]);

  const onDelete = (args: {isDirectory: boolean; name: string; err: NodeJS.ErrnoException | null}): void => {
    const {isDirectory, name, err} = args;

    if (err) {
      dispatch(
        setAlert({
          title: 'Deleting failed',
          message: `Something went wrong during deleting a ${isDirectory ? 'directory' : 'file'}`,
          type: AlertEnum.Error,
        })
      );
    } else {
      dispatch(
        setAlert({
          title: `Successfully deleted a ${isDirectory ? 'directory' : 'file'}`,
          message: `You have successfully deleted ${name} ${isDirectory ? 'directory' : 'file'}`,
          type: AlertEnum.Success,
        })
      );
    }

    /**
     * Deleting is performed immediately.
     * The Ant Tree component is not updated immediately.
     * I show the loader long enough to let the Ant Tree component update.
     */
    setTimeout(() => {
      setProcessingEntity({processingEntityID: undefined, processingType: undefined});
    }, 2000);
  };

  const onRename = (absolutePathToEntity: string, osPlatform: string) => {
    dispatch(openRenameEntityModal({absolutePathToEntity, osPlatform}));
  };

  const onSelect = (selectedKeysValue: React.Key[], info: any) => {
    if (!fileIncludes.some(fileInclude => micromatch.isMatch(path.basename(info.node.key), fileInclude))) {
      return;
    }
    if (scanExcludes.some(scanExclude => micromatch.isMatch(path.basename(info.node.key), scanExclude))) {
      return;
    }
    if (info.node.key) {
      if (isInPreviewMode) {
        stopPreview(dispatch);
      }
      dispatch(setSelectingFile(true));
      dispatch(selectFile({filePath: info.node.key}));
    }
  };

  const openConfirmModal = () => {
    Modal.confirm({
      title: 'You should reload the file explorer to have your changes applied. Do you want to do it now?',
      icon: <ExclamationCircleOutlined />,
      cancelText: 'Not now',
      onOk: () => {
        setScanExcludesStatus('applied');
        refreshFolder();
      },
      onCancel: () => {
        dispatch(setScanExcludesStatus('outdated'));
      },
    });
  };

  const onExcludeFromProcessing = (relativePath: string) => {
    dispatch(updateScanExcludes([...excludedFromScanFiles, relativePath]));

    openConfirmModal();
  };

  const onIncludeToProcessing = (relativePath: string) => {
    dispatch(
      updateScanExcludes(excludedFromScanFiles.filter((_, index) => excludedFromScanFiles[index] !== relativePath))
    );

    openConfirmModal();
  };

  useEffect(() => {
    if (isSelectingFile) {
      dispatch(setSelectingFile(false));
    }
  }, [isSelectingFile, dispatch]);

  useEffect(() => {
    if (uiState.leftMenu.selection === 'file-explorer' && uiState.folderExplorer.isOpen) {
      openFileExplorer();
      dispatch(closeFolderExplorer());
    }
  }, [uiState, dispatch, openFileExplorer]);

  const onExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const onSelectRootFolderFromMainThread = useCallback(
    (_: any, data: string) => {
      if (data) {
        setFolder(data);
      }
    },
    [setFolder]
  );

  const onExecutedFrom = useCallback(
    (_, data) => {
      const folder = data.path || (loadLastFolderOnStartup && recentFolders.length > 0 ? recentFolders[0] : undefined);
      if (folder && getFileStats(folder)?.isDirectory()) {
        setFolder(folder);
        setAutoExpandParent(true);
      }
    },
    [loadLastFolderOnStartup, setFolder, recentFolders]
  );

  // called from main thread because thunks cannot be dispatched by main
  useEffect(() => {
    ipcRenderer.on('set-root-folder', onSelectRootFolderFromMainThread);
    return () => {
      ipcRenderer.removeListener('set-root-folder', onSelectRootFolderFromMainThread);
    };
  }, [onSelectRootFolderFromMainThread]);

  useEffect(() => {
    ipcRenderer.on('executed-from', onExecutedFrom);
    return () => {
      ipcRenderer.removeListener('executed-from', onExecutedFrom);
    };
  }, [onExecutedFrom]);

  const allTreeKeys = useMemo(() => {
    if (!tree) return [];

    // The root element goes first anyway if tree exists
    const treeKeys: string[] = [tree.key];

    /**
     * Recursively finds all the keys and pushes them into array.
     */
    const recursivelyGetAllTheKeys = (arr: TreeNode[]) => {
      if (!arr) return;

      arr.forEach((data: TreeNode) => {
        const {children} = data;

        if (!children.length) return;

        treeKeys.push(data.key);

        recursivelyGetAllTheKeys(data.children);
      });
    };

    recursivelyGetAllTheKeys(tree?.children);

    return treeKeys;
  }, [tree]);

  const onToggleTree = () => {
    setExpandedKeys(prevState => (prevState.length ? [] : allTreeKeys));
  };

  const onCreateFolder = (absolutePath: string) => {
    dispatch(openCreateFolderModal(absolutePath));
  };

  const onCreateResource = ({targetFolder, targetFile}: {targetFolder?: string; targetFile?: string}) => {
    if (targetFolder) {
      dispatch(openNewResourceWizard({defaultInput: {targetFolder}}));
    }
    if (targetFile) {
      dispatch(openNewResourceWizard({defaultInput: {targetFile}}));
    }
  };

  return (
    <FileTreeContainer>
      <Row>
        <MonoPaneTitleCol>
          <MonoPaneTitle>
            <TitleBarContainer>
              <Title>
                File Explorer{' '}
                {isScanExcludesUpdated === 'outdated' ? (
                  <Tooltip title={FileExplorerChanged}>
                    <ExclamationCircleOutlined />
                  </Tooltip>
                ) : (
                  ''
                )}
              </Title>
              <RightButtons>
                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={ReloadFolderTooltip}>
                  <ReloadButton
                    size="small"
                    onClick={refreshFolder}
                    icon={<ReloadOutlined />}
                    type="link"
                    ghost
                    disabled={isButtonDisabled}
                  />
                </Tooltip>
                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={ToggleTreeTooltip}>
                  <Button
                    icon={<Icon name="collapse" />}
                    onClick={onToggleTree}
                    type="link"
                    ghost
                    size="small"
                    disabled={isButtonDisabled}
                  />
                </Tooltip>
                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={BrowseFolderTooltip}>
                  <BrowseButton
                    icon={<FolderAddOutlined />}
                    size="small"
                    type="primary"
                    ghost
                    onClick={openFileExplorer}
                  >
                    {Number(uiState.paneConfiguration.leftWidth.toFixed(2)) < 0.2 ? '' : 'Browse'}
                  </BrowseButton>
                </Tooltip>
              </RightButtons>
            </TitleBarContainer>
          </MonoPaneTitle>
        </MonoPaneTitleCol>
        <FileExplorer {...fileExplorerProps} />
      </Row>
      {uiState.isFolderLoading ? (
        <StyledSkeleton active />
      ) : tree ? (
        <StyledTreeDirectoryTree
          // height is needed to enable Tree's virtual scroll ToDo: Do constants based on the hights of app title and pane title, or get height of parent.
          height={windowHeight && windowHeight > FILE_TREE_HEIGHT_OFFSET ? windowHeight - FILE_TREE_HEIGHT_OFFSET : 0}
          onSelect={onSelect}
          treeData={[tree]}
          ref={treeRef}
          expandedKeys={expandedKeys}
          onExpand={onExpand}
          titleRender={event => {
            return (
              <TreeItem
                treeKey={String(event.key)}
                title={event.title}
                processingEntity={processingEntity}
                setProcessingEntity={setProcessingEntity}
                onDelete={onDelete}
                onRename={onRename}
                onExcludeFromProcessing={onExcludeFromProcessing}
                onIncludeToProcessing={onIncludeToProcessing}
                onCreateFolder={onCreateFolder}
                onCreateResource={onCreateResource}
                {...event}
              />
            );
          }}
          autoExpandParent={autoExpandParent}
          selectedKeys={[selectedPath || '-']}
          filterTreeNode={node => {
            // @ts-ignore
            return node.highlight;
          }}
          disabled={isInPreviewMode || previewLoader.isLoading}
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
