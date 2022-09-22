import React, {Key, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSelector} from 'react-redux';

import {Button, Input, Modal, Tabs} from 'antd';

import {DownOutlined, ExclamationCircleOutlined} from '@ant-design/icons';

import {flatten} from 'lodash';

import {DEFAULT_PANE_TITLE_HEIGHT} from '@constants/constants';

import {CurrentMatch, FileEntry, MatchNode} from '@models/fileentry';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  highlightFileMatches,
  selectFile,
  setSelectingFile,
  updateReplaceQuery,
  updateResourceFilter,
  updateSearchHistory,
  updateSearchQuery,
} from '@redux/reducers/main';
import {
  openCreateFileFolderModal,
  openRenameEntityModal,
  setActiveTab,
  setExpandedSearchedFiles,
} from '@redux/reducers/ui';
import {isInPreviewModeSelector} from '@redux/selectors';
import {getAbsoluteFilePath} from '@redux/services/fileEntry';

import {TitleBar} from '@molecules';

import {useCreate, useDelete, useDuplicate, useFileSelect, useHighlightNode, usePreview} from '@hooks/fileTreeHooks';

import {filterFilesByQuery, getRegexp, notEmpty} from '@utils/filterQuery';
import {replaceInFiles} from '@utils/replaceInFiles';

import TreeItem from '../FileTreePane/TreeItem';
import {FilterTreeNode, TreeNode} from '../FileTreePane/types';
import {createFilteredNode} from './CreateFilteredNode';
import QueryMatchParams from './QueryMatchParams';
import RecentSearch from './RecentSearch';

import * as S from './styled';

const decorate = (arr: FilterTreeNode[]) => {
  return {
    key: 'filter',
    isExcluded: true,
    isSupported: false,
    isLeaf: false,
    title: <></>,
    highlight: false,
    isFolder: true,
    children: arr,
  } as TreeNode;
};

const SearchPane: React.FC<{height: number}> = ({height}) => {
  const [searchTree, setSearchTree] = useState<FilterTreeNode[]>([]);
  const {currentMatch, searchQuery, replaceQuery, queryMatchParams} = useAppSelector(state => state.main.search);
  const [isFindingMatches, setFindingMatches] = useState<boolean>(false);
  const searchCounter = useRef<{filesCount: number; totalMatchCount: number}>({filesCount: 0, totalMatchCount: 0});
  const debounceHandler = useRef<null | ReturnType<typeof setTimeout>>(null);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const isSelectingFile = useAppSelector(state => state.main.isSelectingFile);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const resourceFilter = useAppSelector(state => state.main.resourceFilter);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const recentSearch = useAppSelector(state => state.main.search.searchHistory);
  const activeTab = useAppSelector(state => state.ui.leftMenu.activeTab) || 'search';

  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const {onFileSelect} = useFileSelect();
  const {onPreview} = usePreview();
  const {onDelete, processingEntity, setProcessingEntity} = useDelete();
  const {onDuplicate} = useDuplicate();
  const {onCreateResource} = useCreate();

  const treeRef = useRef<any>();
  const expandedFiles = useAppSelector(state => state.ui.leftMenu.expandedSearchedFiles);
  const {TabPane} = Tabs;

  const highlightFilePath = useHighlightNode(decorate(searchTree), treeRef, expandedFiles);

  const onCreateFileFolder = (absolutePath: string, type: 'file' | 'folder') => {
    dispatch(openCreateFileFolderModal({rootDir: absolutePath, type}));
  };

  useEffect(() => {
    if (selectedResourceId && searchTree.length) {
      const resource = resourceMap[selectedResourceId];

      if (resource) {
        const filePath = resource.filePath;
        highlightFilePath(filePath);
      }
    } else if (!selectedPath && searchTree.length) {
      dispatch(selectFile({filePath: searchTree[0].filePath}));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResourceId, searchTree, selectedPath]);

  const setCurrentMatch = useCallback(
    (options: CurrentMatch | null) => {
      dispatch(highlightFileMatches(options));
    },
    [dispatch]
  );

  const onRename = (absolutePathToEntity: string, osPlatform: string) => {
    dispatch(openRenameEntityModal({absolutePathToEntity, osPlatform}));
  };

  useEffect(() => {
    if (isSelectingFile) {
      dispatch(setSelectingFile(false));
    }
  }, [isSelectingFile, dispatch]);

  // update current match once searchTree or selectedPath is updated
  useEffect(() => {
    const selectedFileData: FilterTreeNode | undefined = searchTree.find(child => child?.filePath === selectedPath);
    if (selectedFileData && selectedFileData.matchLines?.length) {
      const matchesInFile: MatchNode[] = flatten(selectedFileData?.matchLines);
      const options: CurrentMatch = {
        matchesInFile,
        currentMatchIdx: 0,
      };

      setCurrentMatch(options);
    } else {
      // file doesn't contain any matches
      setCurrentMatch(null);
    }
  }, [dispatch, searchTree, selectedPath, setCurrentMatch]);

  const onExpand = (newExpandedFiles: Key[]) => {
    dispatch(setExpandedSearchedFiles(newExpandedFiles));
  };

  const onFilterByFileOrFolder = (relativePath: string | undefined) => {
    dispatch(updateResourceFilter({...resourceFilter, fileOrFolderContainedIn: relativePath}));
  };

  const saveQueryHistory = (query: string) => {
    if (!recentSearch.includes(query)) {
      dispatch(updateSearchHistory(query));
    }
  };

  const findMatches = (query: string) => {
    searchCounter.current = {filesCount: 0, totalMatchCount: 0};
    if (!fileMap) return;
    // reset tree to its default state
    if (!query) {
      setSearchTree([]);
      setFindingMatches(false);
      return;
    }

    const queryRegExp = getRegexp(query, queryMatchParams);

    const filteredFileMap: FileEntry[] = Object.values(fileMap)
      .map((file: FileEntry) => filterFilesByQuery(file, queryRegExp, searchCounter))
      .filter(notEmpty);

    const treeData: FilterTreeNode[] = createFilteredNode(filteredFileMap);

    setSearchTree(treeData);
    saveQueryHistory(query);
    setFindingMatches(false);
  };

  const onNodeSelect = (selectedKeysValue: React.Key[], info: any) => {
    let parentNode = info.node;

    if (info.node.parentKey) {
      parentNode = searchTree.find(({key}) => info.node.parentKey === key);
    }

    const matchesInFile: MatchNode[] = flatten(parentNode.matchLines);
    onFileSelect(selectedKeysValue, info);

    setCurrentMatch({
      matchesInFile,
      currentMatchIdx: matchesInFile.indexOf(info.node.matchItemArr[0] || 0),
    });
  };

  useEffect(() => {
    findMatches(searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryMatchParams, fileMap]);

  useEffect(() => {
    return () => {
      setFindingMatches(false);
      setCurrentMatch(null);
      dispatch(setActiveTab(null));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchQueryChange = (e: {target: HTMLInputElement}) => {
    setFindingMatches(true);
    dispatch(updateSearchQuery(e.target.value));

    debounceHandler.current && clearTimeout(debounceHandler.current);
    debounceHandler.current = setTimeout(() => {
      findMatches(e.target.value);
    }, 1000);
  };

  const handleReplaceQuery = (e: {target: HTMLInputElement}) => {
    dispatch(updateReplaceQuery(e.target.value));
  };

  const handleStep = (step: number) => {
    if (currentMatch) {
      // eslint-disable-next-line no-unsafe-optional-chaining
      const nextIdx = currentMatch?.currentMatchIdx + step; // more matches in this file exists
      if (currentMatch?.matchesInFile[nextIdx]) {
        return setCurrentMatch({...currentMatch, currentMatchIdx: nextIdx});
      }
    }
    const nextFileIdx = searchTree.findIndex(node => node.filePath === selectedPath) + step;
    dispatch(selectFile({filePath: searchTree[nextFileIdx].key}));
  };

  const replaceCurrentSelection = () => {
    if (replaceQuery === searchQuery) return;
    if (currentMatch) {
      setCurrentMatch({...currentMatch, replaceWith: replaceQuery});
    }
  };

  const replaceAll = () => {
    if (replaceQuery === searchQuery) return;
    const title = `Are you sure you want to replace all matches?`;

    Modal.confirm({
      title,
      icon: <ExclamationCircleOutlined />,
      onOk() {
        const queryRegExp = getRegexp(searchQuery, queryMatchParams);
        const files = searchTree.map(file => {
          return getAbsoluteFilePath(file.filePath, fileMap);
        });
        replaceInFiles(files, queryRegExp, replaceQuery, dispatch);
      },
      onCancel() {
        () => {};
      },
    });
  };

  const isReady = searchTree.length && !isFindingMatches;
  const currentMatchNode = currentMatch?.matchesInFile[currentMatch?.currentMatchIdx];

  const isNextEnabled = useMemo(() => {
    if (currentMatchNode) {
      return Number(currentMatchNode?.currentMatchNumber) < searchCounter.current.totalMatchCount;
    }
    const isInMatchFiles = searchTree.findIndex(node => node.filePath === selectedPath);
    if (isInMatchFiles === -1) {
      return true;
    }
  }, [currentMatchNode, searchTree, selectedPath]);
  const isPrevEnabled = Number(currentMatchNode?.currentMatchNumber) > 1;

  const changeTab = (tabKey: string) => {
    dispatch(setActiveTab(tabKey));
  };

  return (
    <S.FileTreeContainer id="AdvancedSearch">
      <TitleBar title="Advanced Search" closable />
      <S.Tabs activeKey={activeTab} onChange={changeTab}>
        <TabPane key="search" tab="Search">
          <S.TreeContainer>
            <S.Form>
              <S.SearchBox>
                <Input placeholder="Search anything..." value={searchQuery} onChange={handleSearchQueryChange} />
                <QueryMatchParams setFindingMatches={setFindingMatches} />
              </S.SearchBox>
            </S.Form>
            <S.RootFolderText>
              {Boolean(isReady) && (
                <S.MatchText id="search-count">
                  <p>
                    {searchCounter.current.totalMatchCount} matches in {searchCounter.current.filesCount} files
                  </p>
                </S.MatchText>
              )}

              {recentSearch.length && !searchQuery && !isFindingMatches ? (
                <RecentSearch
                  recentSearch={recentSearch}
                  handleClick={query => {
                    dispatch(updateSearchQuery(query));
                    findMatches(query);
                  }}
                />
              ) : null}

              {searchQuery && !searchTree.length && !isFindingMatches && 'No matches found'}
            </S.RootFolderText>
            {isFindingMatches && <S.Skeleton active />}

            {isReady ? (
              <S.TreeDirectoryTree
                height={height - 2 * DEFAULT_PANE_TITLE_HEIGHT - 20}
                onSelect={onNodeSelect}
                treeData={[decorate(searchTree)]}
                ref={treeRef}
                expandedKeys={expandedFiles}
                onExpand={onExpand}
                titleRender={(event: any) => (
                  <TreeItem
                    treeKey={String(event.key)}
                    title={event.title}
                    processingEntity={processingEntity}
                    setProcessingEntity={setProcessingEntity}
                    onDelete={onDelete}
                    onRename={onRename}
                    onCreateFileFolder={onCreateFileFolder}
                    onDuplicate={onDuplicate}
                    onCreateResource={onCreateResource}
                    onFilterByFileOrFolder={onFilterByFileOrFolder}
                    onPreview={onPreview}
                    {...event}
                  />
                )}
                autoExpandParent
                defaultExpandAll
                selectedKeys={[selectedPath || '-']}
                filterTreeNode={node => {
                  // @ts-ignore
                  return node.highlight;
                }}
                disabled={isInPreviewMode || previewLoader.isLoading}
                switcherIcon={<DownOutlined />}
                icon={<></>}
              />
            ) : null}
          </S.TreeContainer>
        </TabPane>

        <TabPane key="findReplace" tab="Find &#38; Replace">
          <S.TreeContainer>
            <S.Form>
              <S.Label>Find:</S.Label>
              <S.SearchBox>
                <Input value={searchQuery} onChange={handleSearchQueryChange} />
                <QueryMatchParams setFindingMatches={setFindingMatches} />
              </S.SearchBox>

              <S.Label>Replace:</S.Label>
              <S.SearchBox>
                <Input value={replaceQuery} onChange={handleReplaceQuery} />
              </S.SearchBox>
            </S.Form>
            <S.RootFolderText>
              {isReady ? (
                <>
                  <div>{selectedPath}</div>
                  <S.ResultContainer>
                    <S.MatchText id="search-count-replace">
                      <p>
                        {currentMatchNode?.currentMatchNumber || 0} of {searchCounter.current.totalMatchCount}
                      </p>
                      <span> View in Editor</span>
                    </S.MatchText>
                    <S.ButtonContainer>
                      <Button type="primary" onClick={() => handleStep(-1)} disabled={!isPrevEnabled}>
                        Previous
                      </Button>
                      <Button type="primary" onClick={() => handleStep(1)} disabled={!isNextEnabled}>
                        Next
                      </Button>
                    </S.ButtonContainer>
                  </S.ResultContainer>
                </>
              ) : (
                'No matches found'
              )}

              {replaceQuery && (
                <S.ButtonContainer>
                  <Button type="primary" onClick={replaceCurrentSelection} disabled={!currentMatchNode}>
                    Replace Selected
                  </Button>
                  <Button type="primary" onClick={replaceAll}>
                    Replace All
                  </Button>
                </S.ButtonContainer>
              )}
            </S.RootFolderText>

            {isFindingMatches && <S.Skeleton active />}
          </S.TreeContainer>
        </TabPane>
      </S.Tabs>
    </S.FileTreeContainer>
  );
};

export default SearchPane;
