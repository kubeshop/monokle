import {ipcRenderer} from 'electron';

import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useSelector} from 'react-redux';

import {Button, Modal, Tooltip} from 'antd';

import {ExclamationCircleOutlined, ReloadOutlined} from '@ant-design/icons';

import log from 'loglevel';
import micromatch from 'micromatch';
import path from 'path';

import {FILE_TREE_HEIGHT_OFFSET, ROOT_FILE_ENTRY, TOOLTIP_DELAY} from '@constants/constants';
import {FileExplorerChanged, ReloadFolderTooltip, ToggleTreeTooltip} from '@constants/tooltips';

import {AlertEnum} from '@models/alert';
import {FileMapType, ResourceMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {setScanExcludesStatus, updateProjectConfig} from '@redux/reducers/appConfig';
import {selectFile, setSelectingFile, updateResourceFilter} from '@redux/reducers/main';
import {
  openCreateFolderModal,
  openNewResourceWizard,
  openRenameEntityModal,
  setShouldExpandAllNodes,
} from '@redux/reducers/ui';
import {fileIncludesSelector, isInPreviewModeSelector, scanExcludesSelector, settingsSelector} from '@redux/selectors';
import {getChildFilePath, getResourcesForPath} from '@redux/services/fileEntry';
import {getHelmValuesFile} from '@redux/services/helm';
import {isKustomizationResource} from '@redux/services/kustomize';
import {startPreview, stopPreview} from '@redux/services/preview';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {MonoPaneTitle} from '@atoms';

import Icon from '@components/atoms/Icon';

import {uniqueArr} from '@utils/index';

import AppContext from '@src/AppContext';

import * as S from './Styled';
import TreeItem from './TreeItem';
import {ProcessingEntity, TreeNode} from './types';

const createNode = (
  fileEntry: FileEntry,
  fileMap: FileMapType,
  resourceMap: ResourceMapType,
  hideExcludedFilesInFileExplorer: boolean,
  fileOrFolderContainedInFilter: string | undefined
): TreeNode => {
  const resources = getResourcesForPath(fileEntry.filePath, resourceMap);

  const node: TreeNode = {
    key: fileEntry.filePath,
    title: (
      <S.NodeContainer>
        <S.NodeTitleContainer>
          <span
            className={
              fileEntry.isExcluded
                ? 'excluded-file-entry-name'
                : (fileEntry.isSupported || fileEntry.children) &&
                  (fileOrFolderContainedInFilter ? fileEntry.filePath.startsWith(fileOrFolderContainedInFilter) : true)
                ? 'file-entry-name'
                : 'not-supported-file-entry-name'
            }
          >
            {fileEntry.name}
          </span>
          {resources.length > 0 ? (
            <Tooltip title={`${resources.length} resource${resources.length !== 1 ? 's' : ''} in this file`}>
              <S.NumberOfResources className="file-entry-nr-of-resources">{resources.length}</S.NumberOfResources>
            </Tooltip>
          ) : null}
        </S.NodeTitleContainer>
      </S.NodeContainer>
    ),
    children: [],
    highlight: false,
    isExcluded: fileEntry.isExcluded,
    isSupported: fileEntry.isSupported,
  };

  if (fileEntry.children) {
    if (fileEntry.children.length) {
      node.children = fileEntry.children
        .map(child => fileMap[getChildFilePath(child, fileEntry, fileMap)])
        .filter(childEntry => childEntry)
        .map(childEntry =>
          createNode(childEntry, fileMap, resourceMap, hideExcludedFilesInFileExplorer, fileOrFolderContainedInFilter)
        )
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

const FileTreePane = () => {
  const {windowSize} = useContext(AppContext);
  const windowHeight = windowSize.height;

  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [expandedKeys, setExpandedKeys] = useState<Array<React.Key>>([]);
  const [highlightNode, setHighlightNode] = useState<TreeNode>();
  const [processingEntity, setProcessingEntity] = useState<ProcessingEntity>({
    processingEntityID: undefined,
    processingType: undefined,
  });
  const [tree, setTree] = useState<TreeNode | null>(null);

  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);

  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const fileOrFolderContainedInFilter = useAppSelector(state => state.main.resourceFilter.fileOrFolderContainedIn);
  const isScanExcludesUpdated = useAppSelector(state => state.config.isScanExcludesUpdated);
  const isSelectingFile = useAppSelector(state => state.main.isSelectingFile);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const resourceFilter = useAppSelector(state => state.main.resourceFilter);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const shouldExpandAllNodes = useAppSelector(state => state.ui.shouldExpandAllNodes);
  const uiState = useAppSelector(state => state.ui);
  const configState = useAppSelector(state => state.config);
  const scanExcludes = useAppSelector(scanExcludesSelector);
  const fileIncludes = useAppSelector(fileIncludesSelector);
  const {hideExcludedFilesInFileExplorer} = useAppSelector(settingsSelector);

  const treeRef = useRef<any>();

  const isButtonDisabled = !fileMap[ROOT_FILE_ENTRY];

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
    const treeData =
      rootEntry &&
      createNode(
        rootEntry,
        fileMap,
        resourceMap,
        Boolean(hideExcludedFilesInFileExplorer),
        fileOrFolderContainedInFilter
      );

    setTree(treeData);

    if (shouldExpandAllNodes) {
      setExpandedKeys(Object.keys(fileMap).filter(key => fileMap[key]?.children?.length));
      dispatch(setShouldExpandAllNodes(false));
    }
  }, [
    resourceMap,
    fileMap,
    shouldExpandAllNodes,
    hideExcludedFilesInFileExplorer,
    fileOrFolderContainedInFilter,
    dispatch,
  ]);

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
      node = node.children.find((i: any) => i.key === keys[c]);
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
    dispatch(
      updateProjectConfig({
        config: {
          ...configState.projectConfig,
          scanExcludes: [...scanExcludes, relativePath],
        },
        fromConfigFile: false,
      })
    );
    openConfirmModal();
  };

  const onIncludeToProcessing = (relativePath: string) => {
    dispatch(
      updateProjectConfig({
        config: {
          ...configState.projectConfig,
          scanExcludes: scanExcludes.filter(scanExclude => scanExclude !== relativePath),
        },
        fromConfigFile: false,
      })
    );
    openConfirmModal();
  };

  useEffect(() => {
    if (isSelectingFile) {
      dispatch(setSelectingFile(false));
    }
  }, [isSelectingFile, dispatch]);

  const onExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
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

  const onToggleTree = () => {
    setExpandedKeys(prevState => (prevState.length ? [] : allTreeKeys));
  };

  const onCreateFolder = (absolutePath: string) => {
    dispatch(openCreateFolderModal(absolutePath));
  };

  const onPreview = useCallback(
    (relativePath: string) => {
      const resources = getResourcesForPath(relativePath, resourceMap);
      if (resources && resources.length === 1 && isKustomizationResource(resources[0])) {
        startPreview(resources[0].id, 'kustomization', dispatch);
      } else {
        const fileEntry = fileMap[relativePath];
        if (fileEntry) {
          const valuesFile = getHelmValuesFile(fileEntry, helmValuesMap);
          if (valuesFile) {
            startPreview(valuesFile.id, 'helm', dispatch);
          }
        }
      }
    },
    [dispatch, fileMap, helmValuesMap, resourceMap]
  );

  const onCreateResource = ({targetFolder, targetFile}: {targetFolder?: string; targetFile?: string}) => {
    if (targetFolder) {
      dispatch(openNewResourceWizard({defaultInput: {targetFolder}}));
    }
    if (targetFile) {
      dispatch(openNewResourceWizard({defaultInput: {targetFile}}));
    }
  };

  useEffect(() => {
    // removes any highlight when a file is selected
    if (selectedPath && highlightNode) {
      highlightNode.highlight = false;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightNode]);

  useEffect(() => {
    if (leftMenuSelection !== 'file-explorer') {
      return;
    }

    if (selectedPath) {
      treeRef?.current?.scrollTo({key: selectedPath});
      return;
    }

    if (highlightNode) {
      treeRef?.current?.scrollTo({key: highlightNode.key});
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftMenuSelection]);

  const onFilterByFileOrFolder = (relativePath: string | undefined) => {
    dispatch(updateResourceFilter({...resourceFilter, fileOrFolderContainedIn: relativePath}));
  };

  return (
    <S.FileTreeContainer id="FileExplorer">
      <S.TitleBarContainer>
        <MonoPaneTitle>
          <S.TitleContainer>
            <S.Title>
              File Explorer{' '}
              {isScanExcludesUpdated === 'outdated' && (
                <Tooltip title={FileExplorerChanged}>
                  <ExclamationCircleOutlined />
                </Tooltip>
              )}
            </S.Title>

            <S.RightButtons>
              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={ReloadFolderTooltip}>
                <Button
                  size="small"
                  onClick={refreshFolder}
                  icon={<ReloadOutlined />}
                  type="link"
                  disabled={isButtonDisabled}
                />
              </Tooltip>

              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={ToggleTreeTooltip}>
                <Button
                  icon={<Icon name="collapse" />}
                  onClick={onToggleTree}
                  type="link"
                  size="small"
                  disabled={isButtonDisabled}
                />
              </Tooltip>
            </S.RightButtons>
          </S.TitleContainer>
        </MonoPaneTitle>
      </S.TitleBarContainer>

      {uiState.isFolderLoading ? (
        <S.Skeleton active />
      ) : tree ? (
        <S.TreeContainer>
          <S.RootFolderText>
            <div id="file-explorer-project-name">{fileMap[ROOT_FILE_ENTRY].filePath}</div>
            <div id="file-explorer-count">{Object.values(fileMap).filter(f => !f.children).length} files</div>
          </S.RootFolderText>
          <S.TreeDirectoryTree
            // height is needed to enable Tree's virtual scroll ToDo: Do constants based on the hights of app title and pane title, or get height of parent.
            height={
              windowHeight && windowHeight > FILE_TREE_HEIGHT_OFFSET
                ? windowHeight - FILE_TREE_HEIGHT_OFFSET - (isInPreviewMode ? 25 : 0)
                : 0
            }
            onSelect={onSelect}
            treeData={[tree]}
            ref={treeRef}
            expandedKeys={expandedKeys}
            onExpand={onExpand}
            titleRender={event => (
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
                onFilterByFileOrFolder={onFilterByFileOrFolder}
                onPreview={onPreview}
                {...event}
              />
            )}
            autoExpandParent={autoExpandParent}
            selectedKeys={[selectedPath || '-']}
            filterTreeNode={node => {
              // @ts-ignore
              return node.highlight;
            }}
            disabled={isInPreviewMode || previewLoader.isLoading}
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
