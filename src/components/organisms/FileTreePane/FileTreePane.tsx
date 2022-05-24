import {ipcRenderer} from 'electron';

import React, {Key, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {useUpdateEffect} from 'react-use';

import {Button, Input, Modal, Tooltip} from 'antd';

import {ExclamationCircleOutlined, ReloadOutlined} from '@ant-design/icons';

import {cloneDeep} from 'lodash';
import log from 'loglevel';
import micromatch from 'micromatch';
import path from 'path';

import {DEFAULT_PANE_TITLE_HEIGHT, ROOT_FILE_ENTRY, TOOLTIP_DELAY} from '@constants/constants';
import {CollapseTreeTooltip, ExpandTreeTooltip, FileExplorerChanged, ReloadFolderTooltip} from '@constants/tooltips';

import {AlertEnum} from '@models/alert';
import {FileMapType, ResourceMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {updateProjectConfig} from '@redux/reducers/appConfig';
import {selectFile, setSelectingFile, updateResourceFilter} from '@redux/reducers/main';
import {
  openCreateFileFolderModal,
  openNewResourceWizard,
  openRenameEntityModal,
  setExpandedFolders,
} from '@redux/reducers/ui';
import {fileIncludesSelector, isInPreviewModeSelector, scanExcludesSelector, settingsSelector} from '@redux/selectors';
import {getChildFilePath, getResourcesForPath} from '@redux/services/fileEntry';
import {getHelmValuesFile} from '@redux/services/helm';
import {isKustomizationResource} from '@redux/services/kustomize';
import {startPreview, stopPreview} from '@redux/services/preview';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {TitleBar} from '@molecules';

import {Icon} from '@atoms';

import {duplicateEntity} from '@utils/files';
import {uniqueArr} from '@utils/index';

import TreeItem from './TreeItem';
import {ProcessingEntity, TreeNode} from './types';

import * as S from './styled';

const createNode = (
  fileEntry: FileEntry,
  fileMap: FileMapType,
  resourceMap: ResourceMapType,
  hideExcludedFilesInFileExplorer: boolean,
  hideUnsupportedFilesInFileExplorer: boolean,
  fileOrFolderContainedInFilter: string | undefined,
  rootFolderName: string
): TreeNode => {
  const resources = getResourcesForPath(fileEntry.filePath, resourceMap);
  const isRoot = fileEntry.name === ROOT_FILE_ENTRY;
  const key = isRoot ? ROOT_FILE_ENTRY : fileEntry.filePath;
  const name = isRoot ? rootFolderName : fileEntry.name;

  const node: TreeNode = {
    key,
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
            {name}
          </span>
          {resources.length > 0 ? (
            <Tooltip
              mouseEnterDelay={TOOLTIP_DELAY}
              title={`${resources.length} resource${resources.length !== 1 ? 's' : ''} in this file`}
            >
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
    text: fileEntry?.text,
  };

  if (fileEntry.children) {
    if (fileEntry.children.length) {
      node.children = fileEntry.children
        .map(child => fileMap[getChildFilePath(child, fileEntry, fileMap)])
        .filter(childEntry => childEntry)
        .map(childEntry =>
          createNode(
            childEntry,
            fileMap,
            resourceMap,
            hideExcludedFilesInFileExplorer,
            hideUnsupportedFilesInFileExplorer,
            fileOrFolderContainedInFilter,
            rootFolderName
          )
        )
        .filter(childEntry => {
          if (!hideExcludedFilesInFileExplorer) {
            return childEntry;
          }

          return !childEntry.isExcluded;
        })
        .filter(childEntry => {
          if (!hideUnsupportedFilesInFileExplorer || childEntry.isFolder) {
            return childEntry;
          }

          return childEntry.isSupported;
        });
    }
    node.isFolder = true;
  } else {
    node.isLeaf = true;
  }

  return node;
};

type Props = {
  height: number;
};

type MatchParamProps = {
  matchCase: boolean;
  matchWholeWord: boolean;
  regExp: boolean;
};

const FileTreePane: React.FC<Props> = ({height}) => {
  const [highlightNode, setHighlightNode] = useState<TreeNode>();
  const [processingEntity, setProcessingEntity] = useState<ProcessingEntity>({
    processingEntityID: undefined,
    processingType: undefined,
  });
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [searchTree, setSearchTree] = useState<TreeNode | null>(null);
  const [searchQuery, updateSearchQuery] = useState<string>('');
  const debounceHandler = useRef<null | ReturnType<typeof setTimeout>>(null);
  const [queryMatchParam, setQueryMatchParam] = useState<MatchParamProps>({
    matchCase: false,
    matchWholeWord: false,
    regExp: false,
  });

  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);

  const dispatch = useAppDispatch();
  const configState = useAppSelector(state => state.config);
  const expandedFolders = useAppSelector(state => state.ui.leftMenu.expandedFolders);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const fileOrFolderContainedInFilter = useAppSelector(state => state.main.resourceFilter.fileOrFolderContainedIn);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const isFolderLoading = useAppSelector(state => state.ui.isFolderLoading);
  const isScanExcludesUpdated = useAppSelector(state => state.config.isScanExcludesUpdated);
  const isSelectingFile = useAppSelector(state => state.main.isSelectingFile);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const resourceFilter = useAppSelector(state => state.main.resourceFilter);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);

  const {hideExcludedFilesInFileExplorer, hideUnsupportedFilesInFileExplorer} = useAppSelector(settingsSelector);
  const fileIncludes = useAppSelector(fileIncludesSelector);
  const scanExcludes = useAppSelector(scanExcludesSelector);

  const treeRef = useRef<any>();

  const isButtonDisabled = !fileMap[ROOT_FILE_ENTRY];
  const isCollapsed = expandedFolders.length === 0;

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

  function highlightFilePath(filePath: string) {
    const paths = filePath.split(path.sep);
    const keys: Array<React.Key> = [ROOT_FILE_ENTRY];

    for (let c = 1; c < paths.length; c += 1) {
      keys.push(paths.slice(0, c + 1).join(path.sep));
    }

    let node: TreeNode | undefined = tree || undefined;
    for (let c = 1; c < keys.length && node; c += 1) {
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
    dispatch(setExpandedFolders(uniqueArr([...expandedFolders, ...Array.from(keys)])));
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

  const onDuplicate = (absolutePathToEntity: string, entityName: string, dirName: string) => {
    duplicateEntity(absolutePathToEntity, entityName, dirName, args => {
      const {duplicatedFileName, err} = args;

      if (err) {
        dispatch(
          setAlert({
            title: 'Duplication failed',
            message: `Something went wrong during duplicating "${absolutePathToEntity}"`,
            type: AlertEnum.Error,
          })
        );
      } else {
        dispatch(
          setAlert({
            title: `Duplication succeded`,
            message: `You have successfully created ${duplicatedFileName}`,
            type: AlertEnum.Success,
          })
        );
      }
    });
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
        refreshFolder();
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
    dispatch(setExpandedFolders(isCollapsed ? allTreeKeys : []));
  };

  const onCreateFileFolder = (absolutePath: string, type: 'file' | 'folder') => {
    dispatch(openCreateFileFolderModal({rootDir: absolutePath, type}));
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

  useUpdateEffect(() => {
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
  }, [tree]);

  const onFilterByFileOrFolder = (relativePath: string | undefined) => {
    dispatch(updateResourceFilter({...resourceFilter, fileOrFolderContainedIn: relativePath}));
  };

  function filterTree(treeChild: TreeNode, query: string): TreeNode {
    if (treeChild.text) {
      return treeChild.text.includes(query) ? treeChild : (null as unknown as TreeNode);
    }

    if (treeChild.isFolder && tree?.children.length) {
      treeChild.children = treeChild.children
        .map(currentItem => filterTree(currentItem, query))
        .filter((v: TreeNode | null) => Boolean(v))
        .filter((v: TreeNode) => {
          return !v.isFolder || (v.isFolder === true && v.children.length > 0);
        }); // filter out folders that don't contain files that match query search;
    }

    if (!treeChild.text && !treeChild.isFolder) {
      return null as unknown as TreeNode;
    }

    return treeChild;
  }

  const findMatches = (query: string) => {
    if (!tree) return;
    // reset tree to its default state
    if (!query) {
      setSearchTree(null);
      return;
    }

    let searchedTree = cloneDeep(tree);

    const newTree: TreeNode[] = searchedTree.children
      .map(currentItem => filterTree(currentItem, query))
      .filter(Boolean)
      .filter((v: TreeNode) => {
        return !v.isFolder || (v.isFolder && v.children.length > 0);
      });

    setSearchTree({...searchedTree, children: newTree});
  };

  const handleSearchQueryChange = (e: {target: HTMLInputElement}) => {
    updateSearchQuery(e.target.value);

    debounceHandler.current && clearTimeout(debounceHandler.current);
    debounceHandler.current = setTimeout(() => {
      findMatches(e.target.value);
    }, 1000);
  };

  const toggleMatchParam = (param: keyof MatchParamProps) => {
    setQueryMatchParam(prevState => ({...prevState, [param]: !prevState[param]}));
  };

  const treeToRender = searchTree || tree;

  return (
    <S.FileTreeContainer id="FileExplorer">
      <TitleBar
        title="File Explorer"
        closable
        leftButtons={
          <>
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
          </>
        }
      />

      {isFolderLoading ? (
        <S.Skeleton active />
      ) : treeToRender ? (
        <S.TreeContainer>
          <S.SearchBox>
            <Input placeholder="Search anything..." value={searchQuery} onChange={handleSearchQueryChange} />
            <S.StyledButton $isItemSelected={queryMatchParam.matchCase} onClick={() => toggleMatchParam('matchCase')}>
              Aa
            </S.StyledButton>
            <S.StyledButton
              $isItemSelected={queryMatchParam.matchWholeWord}
              onClick={() => toggleMatchParam('matchWholeWord')}
            >
              [
            </S.StyledButton>
            <S.StyledButton $isItemSelected={queryMatchParam.regExp} onClick={() => toggleMatchParam('regExp')}>
              .*
            </S.StyledButton>
          </S.SearchBox>
          <S.RootFolderText style={{height: DEFAULT_PANE_TITLE_HEIGHT}}>
            <S.FilePathLabel id="file-explorer-project-name">{fileMap[ROOT_FILE_ENTRY].filePath}</S.FilePathLabel>
            <div id="file-explorer-count">{filesOnly.length} files</div>
          </S.RootFolderText>
          <S.TreeDirectoryTree
            height={height - 2 * DEFAULT_PANE_TITLE_HEIGHT - 20}
            onSelect={onSelect}
            treeData={[treeToRender]}
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
