import {ipcRenderer} from 'electron';

import React, {Key, useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {Button, Tooltip} from 'antd';

import {ExclamationCircleOutlined, FileOutlined, FolderOutlined, ReloadOutlined} from '@ant-design/icons';

import log from 'loglevel';
import path from 'path';

import {DEFAULT_PANE_TITLE_HEIGHT, TOOLTIP_DELAY} from '@constants/constants';
import {CollapseTreeTooltip, ExpandTreeTooltip, FileExplorerChanged, ReloadFolderTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openCreateFileFolderModal, setExpandedFolders} from '@redux/reducers/ui';
import {
  isInClusterModeSelector,
  isInPreviewModeSelectorNew,
  selectedFilePathSelector,
  settingsSelector,
} from '@redux/selectors';
import {localResourceMetaMapSelector} from '@redux/selectors/resourceMapSelectors';
import {isHelmChartFile, isHelmTemplateFile, isHelmValuesFile} from '@redux/services/helm';
import {isKustomizationFilePath} from '@redux/services/kustomize';
import {setRootFolder} from '@redux/thunks/setRootFolder';

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

import {Icon, TitleBar} from '@monokle/components';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {isResourceSelection} from '@shared/models/selection';

import {createNode} from './CreateNode';
import TreeItem from './TreeItem';
import {TreeNode} from './types';

import * as S from './styled';

const FilePane: React.FC = () => {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const dispatch = useAppDispatch();
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const expandedFolders = useAppSelector(state => state.ui.leftMenu.expandedFolders);
  const fileExplorerSortOrder = useAppSelector(state => state.config.fileExplorerSortOrder);
  const fileMap = useAppSelector(state => state.main.fileMap);

  const fileOrFolderContainedInFilter = useAppSelector(state => state.main.resourceFilter.fileOrFolderContainedIn);
  const isFolderLoading = useAppSelector(state => state.ui.isFolderLoading);
  const isScanExcludesUpdated = useAppSelector(state => state.config.isScanExcludesUpdated);
  const isPreviewLoading = useAppSelector(state => state.main.previewOptions.isLoading);
  const localResourceMetaMap = useAppSelector(localResourceMetaMapSelector);
  const selectedPath = useAppSelector(selectedFilePathSelector);
  const localResourceSelection = useAppSelector(state =>
    isResourceSelection(state.main.selection) && state.main.selection.resourceIdentifier.storage === 'local'
      ? state.main.selection
      : undefined
  );
  const rootEntry = useAppSelector(state => state.main.fileMap[ROOT_FILE_ENTRY]);

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

  const isButtonDisabled = !rootEntry;
  const isCollapsed = expandedFolders.length === 0 || expandedFolders.length === 1;

  const rootFolderName = useMemo(() => {
    return rootEntry ? path.basename(rootEntry.filePath) : ROOT_FILE_ENTRY;
  }, [rootEntry]);

  const setFolder = useCallback(
    (folder: string) => {
      dispatch(setRootFolder(folder));
    },
    [dispatch]
  );

  const refreshFolder = useCallback(() => {
    setFolder(rootEntry.filePath);
  }, [rootEntry?.filePath, setFolder]);

  const {onExcludeFromProcessing, onIncludeToProcessing} = useProcessing(refreshFolder);

  useEffect(() => {
    if (isFolderLoading) {
      setTree(null);
      return;
    }

    const treeData =
      rootEntry &&
      createNode(
        rootEntry,
        fileMap,
        localResourceMetaMap,
        Boolean(hideExcludedFilesInFileExplorer),
        Boolean(hideUnsupportedFilesInFileExplorer),
        fileOrFolderContainedInFilter,
        rootFolderName
      );

    setTree(treeData);
  }, [
    isFolderLoading,
    localResourceMetaMap,
    fileMap,
    hideExcludedFilesInFileExplorer,
    hideUnsupportedFilesInFileExplorer,
    fileOrFolderContainedInFilter,
    rootFolderName,
    dispatch,
    rootEntry,
  ]);

  /**
   * This useEffect ensures that the right treeNodes are expanded and highlighted
   * when a resource is selected
   */

  useEffect(() => {
    if (localResourceSelection && tree) {
      const resource = localResourceMetaMap[localResourceSelection.resourceIdentifier.id];

      if (resource) {
        const filePath = resource.origin.filePath;
        highlightFilePath(filePath);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree]);

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
      <TitleBar
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
            in <span id="file-explorer-project-name">{rootEntry?.filePath}</span>
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
            disabled={isInPreviewMode || isInClusterMode || isPreviewLoading}
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

export default FilePane;
