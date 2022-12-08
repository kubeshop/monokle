import {ipcRenderer} from 'electron';

import React, {Key, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSelector} from 'react-redux';

import {Button, Tooltip} from 'antd';

import {ExclamationCircleOutlined, FileOutlined, FolderOutlined, ReloadOutlined} from '@ant-design/icons';

import log from 'loglevel';
import path from 'path';

import {DEFAULT_PANE_TITLE_HEIGHT, TOOLTIP_DELAY} from '@constants/constants';
import {CollapseTreeTooltip, ExpandTreeTooltip, FileExplorerChanged, ReloadFolderTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setSelectingFile} from '@redux/reducers/main';
import {openCreateFileFolderModal, setExpandedFolders} from '@redux/reducers/ui';
import {settingsSelector} from '@redux/selectors';
import {isHelmChartFile, isHelmTemplateFile, isHelmValuesFile} from '@redux/services/helm';
import {isKustomizationFilePath} from '@redux/services/kustomize';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {Icon} from '@atoms';

import {TitleBarWrapper} from '@components/atoms/StyledComponents/TitleBarWrapper';

import {
  useCreate,
  useDelete,
  useDuplicate,
  useFileSelect,
  useFilterByFileOrFolder,
  useHighlightNode,
  usePreview,
  useProcessing,
  useRename,
} from '@hooks/fileTreeHooks';
import {usePaneHeight} from '@hooks/usePaneHeight';

import {sortFoldersFiles} from '@utils/fileExplorer';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {isInPreviewModeSelector} from '@shared/utils/selectors';

import {createNode} from './CreateNode';
import TreeItem from './TreeItem';
import {TreeNode} from './types';

import * as S from './styled';

const FileTreePane: React.FC = () => {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);

  const dispatch = useAppDispatch();
  const expandedFolders = useAppSelector(state => state.ui.leftMenu.expandedFolders);
  const fileExplorerSortOrder = useAppSelector(state => state.config.fileExplorerSortOrder);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const fileOrFolderContainedInFilter = useAppSelector(state => state.main.resourceFilter.fileOrFolderContainedIn);
  const isFolderLoading = useAppSelector(state => state.ui.isFolderLoading);
  const isScanExcludesUpdated = useAppSelector(state => state.config.isScanExcludesUpdated);
  const isSelectingFile = useAppSelector(state => state.main.isSelectingFile);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);

  const {onFileSelect} = useFileSelect();
  const {onPreview} = usePreview();
  const {onDelete, processingEntity, setProcessingEntity} = useDelete();
  const {onCreateResource} = useCreate();
  const {onDuplicate} = useDuplicate();
  const {onFilterByFileOrFolder} = useFilterByFileOrFolder();
  const {onRename} = useRename();

  const onCreateFileFolder = (absolutePath: string, type: 'file' | 'folder') => {
    dispatch(openCreateFileFolderModal({rootDir: absolutePath, type}));
  };

  const height = usePaneHeight();

  const {hideExcludedFilesInFileExplorer, hideUnsupportedFilesInFileExplorer} = useAppSelector(settingsSelector);

  const treeRef = useRef<any>();
  const highlightFilePath = useHighlightNode(tree, treeRef, expandedFolders);

  const isButtonDisabled = !fileMap[ROOT_FILE_ENTRY];
  const isCollapsed = expandedFolders.length === 0 || expandedFolders.length === 1;

  const rootFolderName = useMemo(() => {
    return fileMap[ROOT_FILE_ENTRY] ? path.basename(fileMap[ROOT_FILE_ENTRY].filePath) : ROOT_FILE_ENTRY;
  }, [fileMap]);

  const setFolder = useCallback(
    (folder: string) => {
      dispatch(setRootFolder(folder));
    },
    [dispatch]
  );

  const refreshFolder = useCallback(() => {
    setFolder(fileMap[ROOT_FILE_ENTRY].filePath);
  }, [fileMap, setFolder]);

  const {onExcludeFromProcessing, onIncludeToProcessing} = useProcessing(refreshFolder);

  useEffect(() => {
    if (isFolderLoading) {
      setTree(null);
      return;
    }

    const rootEntry = fileMap[ROOT_FILE_ENTRY];
    const treeData =
      rootEntry &&
      createNode(
        rootEntry,
        fileMap,
        resourceMap,
        Boolean(hideExcludedFilesInFileExplorer),
        Boolean(hideUnsupportedFilesInFileExplorer),
        fileOrFolderContainedInFilter,
        rootFolderName
      );

    setTree(treeData);
  }, [
    isFolderLoading,
    resourceMap,
    fileMap,
    hideExcludedFilesInFileExplorer,
    hideUnsupportedFilesInFileExplorer,
    fileOrFolderContainedInFilter,
    rootFolderName,
    dispatch,
  ]);

  /**
   * This useEffect ensures that the right treeNodes are expanded and highlighted
   * when a resource is selected
   */

  useEffect(() => {
    if (selectedResourceId && tree) {
      const resource = resourceMap[selectedResourceId];

      if (resource) {
        const filePath = resource.filePath;
        highlightFilePath(filePath);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree]);

  useEffect(() => {
    if (isSelectingFile) {
      dispatch(setSelectingFile(false));
    }
  }, [isSelectingFile, dispatch]);

  const onExpand = (newExpandedFolders: Key[]) => {
    dispatch(setExpandedFolders(newExpandedFolders));
  };

  const onSelectRootFolderFromMainThread = useCallback(
    (_: any, data: string) => {
      if (data) {
        log.info('setting root folder from main thread', data);
        setFolder(data);
      }
    },
    [setFolder]
  );

  // called from main thread because thunks cannot be dispatched by main
  useEffect(() => {
    ipcRenderer.on('set-root-folder', onSelectRootFolderFromMainThread);
    return () => {
      ipcRenderer.removeListener('set-root-folder', onSelectRootFolderFromMainThread);
    };
  }, [onSelectRootFolderFromMainThread]);

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

  const filesOnly = useMemo(() => Object.values(fileMap).filter(f => !f.children), [fileMap]);

  const onToggleTree = () => {
    dispatch(setExpandedFolders(isCollapsed ? allTreeKeys : tree ? [tree.key] : []));
  };

  return (
    <S.FileTreeContainer id="FileExplorer">
      <TitleBarWrapper
        expandable
        isOpen
        title="Files"
        actions={
          <S.TitleBarActions>
            {isScanExcludesUpdated === 'outdated' && (
              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={FileExplorerChanged}>
                <ExclamationCircleOutlined />
              </Tooltip>
            )}
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={ReloadFolderTooltip}>
              <Button
                size="small"
                onClick={refreshFolder}
                icon={<ReloadOutlined />}
                type="link"
                disabled={isButtonDisabled}
              />
            </Tooltip>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={isCollapsed ? ExpandTreeTooltip : CollapseTreeTooltip}>
              <Button
                icon={<Icon name="collapse" />}
                onClick={onToggleTree}
                type="link"
                size="small"
                disabled={isButtonDisabled}
              />
            </Tooltip>
          </S.TitleBarActions>
        }
        description={
          <S.RootFolderText>
            <span id="file-explorer-count">
              <b>{filesOnly.length || 0} files</b>
            </span>{' '}
            in <span id="file-explorer-project-name">{fileMap[ROOT_FILE_ENTRY].filePath}</span>
          </S.RootFolderText>
        }
      />

      {isFolderLoading ? (
        <S.Skeleton active />
      ) : tree ? (
        <S.TreeContainer>
          <S.TreeDirectoryTree
            height={height - 2 * DEFAULT_PANE_TITLE_HEIGHT - 20}
            onSelect={onFileSelect}
            treeData={[sortFoldersFiles(fileExplorerSortOrder, tree)]}
            ref={treeRef}
            expandedKeys={expandedFolders}
            onExpand={onExpand}
            titleRender={(event: any) => (
              <TreeItem
                treeKey={String(event.key)}
                title={event.title}
                processingEntity={processingEntity}
                setProcessingEntity={setProcessingEntity}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onRename={onRename}
                onExcludeFromProcessing={onExcludeFromProcessing}
                onIncludeToProcessing={onIncludeToProcessing}
                onCreateFileFolder={onCreateFileFolder}
                onCreateResource={onCreateResource}
                onFilterByFileOrFolder={onFilterByFileOrFolder}
                onPreview={onPreview}
                {...event}
              />
            )}
            autoExpandParent={false}
            selectedKeys={[selectedPath || '-']}
            filterTreeNode={node => {
              // @ts-ignore
              return node.highlight;
            }}
            disabled={isInPreviewMode || previewLoader.isLoading}
            icon={(props: any) => {
              if (props.isFolder) {
                return <FolderOutlined />;
              }

              if (isKustomizationFilePath(props.filePath)) {
                return <Icon name="kustomize" style={{fontSize: 15}} />;
              }

              if (
                isHelmChartFile(props.filePath) ||
                isHelmTemplateFile(props.filePath) ||
                isHelmValuesFile(props.filePath)
              ) {
                return <Icon name="helm" style={{fontSize: 18, paddingTop: '3px'}} />;
              }

              return <FileOutlined />;
            }}
            showIcon
            showLine={{showLeafIcon: false}}
          />
        </S.TreeContainer>
      ) : (
        <S.NoFilesContainer>
          Get started by selecting a folder containing manifests, kustomizations or Helm Charts.
        </S.NoFilesContainer>
      )}
    </S.FileTreeContainer>
  );
};

export default FileTreePane;
