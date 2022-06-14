import React, {Key, useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';

import {Input} from 'antd';

import {DownOutlined} from '@ant-design/icons';

import {DEFAULT_PANE_TITLE_HEIGHT} from '@constants/constants';

import {FileEntry} from '@models/fileentry';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setSelectingFile, updateResourceFilter} from '@redux/reducers/main';
<<<<<<< HEAD
import {openRenameEntityModal, setExpandedSearchedFiles, openCreateFileFolderModal} from '@redux/reducers/ui';
import {isInPreviewModeSelector, settingsSelector} from '@redux/selectors';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {TitleBar} from '@molecules';

import {useCreate, useDelete, useDuplicate, useFileSelect, useHighlightNode, usePreview, useProcessing} from '@hooks/fileTreeHooks';
=======
import {openRenameEntityModal, setExpandedSearchedFiles} from '@redux/reducers/ui';
import {isInPreviewModeSelector} from '@redux/selectors';

import {TitleBar} from '@molecules';

import {useCreate, useDelete, useFileSelect, useHighlightNode, usePreview} from '@hooks/fileTreeHooks';
>>>>>>> refactor: cleanup searchPane, remove tree dots on hover for match lines

import electronStore from '@utils/electronStore';
import {MatchParamProps, getMatchLines, getRegexp} from '@utils/getRegexp';

import TreeItem from '../FileTreePane/TreeItem';
import {FilterTreeNode} from '../FileTreePane/types';
import {createFilteredNode} from './CreateFilteredNode';
import RecentSearch from './RecentSearch';

import * as S from './styled';

type Props = {
  height: number;
};

const SearchPane: React.FC<Props> = ({height}) => {
  const [searchTree, setSearchTree] = useState<FilterTreeNode | null>(null);
  const [isFindingMatches, setFindingMatches] = useState<boolean>(false);
  const [searchQuery, updateSearchQuery] = useState<string>('');
  const searchCounter = useRef<{filesCount: number; totalMatchCount: number}>({filesCount: 0, totalMatchCount: 0});
  const debounceHandler = useRef<null | ReturnType<typeof setTimeout>>(null);
  const [queryMatchParam, setQueryMatchParam] = useState<MatchParamProps>({
    matchCase: false,
    matchWholeWord: false,
    regExp: false,
  });

  const isInPreviewMode = useSelector(isInPreviewModeSelector);

  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const isSelectingFile = useAppSelector(state => state.main.isSelectingFile);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const resourceFilter = useAppSelector(state => state.main.resourceFilter);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const onLineSelect = useFileSelect();
  const onPreview = usePreview();
  const {onDelete, processingEntity, setProcessingEntity} = useDelete();
  const {onDuplicate} = useDuplicate();
  const {onCreateResource} = useCreate();

  const treeRef = useRef<any>();
  const expandedFiles = useAppSelector(state => state.ui.leftMenu.expandedSearchedFiles);

<<<<<<< HEAD
  const highlightFilePath = useHighlightNode(tree, treeRef, expandedFiles);

  const rootFolderName = useMemo(() => {
    return fileMap[ROOT_FILE_ENTRY] ? path.basename(fileMap[ROOT_FILE_ENTRY].filePath) : ROOT_FILE_ENTRY;
  }, [fileMap]);

  const setFolder = useCallback(
    (folder: string) => {
      dispatch(setRootFolder(folder));
    },
    [dispatch]
  );

  const onCreateFileFolder = (absolutePath: string, type: 'file' | 'folder') => {
    dispatch(openCreateFileFolderModal({rootDir: absolutePath, type}));
  };

  const refreshFolder = useCallback(() => {
    setFolder(fileMap[ROOT_FILE_ENTRY].filePath);
  }, [fileMap, setFolder]);

  const {onExcludeFromProcessing, onIncludeToProcessing} = useProcessing(refreshFolder);
=======
  const highlightFilePath = useHighlightNode(searchTree, treeRef, expandedFiles);
>>>>>>> refactor: cleanup searchPane, remove tree dots on hover for match lines

  useEffect(() => {
    if (selectedResourceId && searchTree) {
      const resource = resourceMap[selectedResourceId];

      if (resource) {
        const filePath = resource.filePath;
        highlightFilePath(filePath);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResourceId, searchTree]);

  const onRename = (absolutePathToEntity: string, osPlatform: string) => {
    dispatch(openRenameEntityModal({absolutePathToEntity, osPlatform}));
  };

  useEffect(() => {
    if (isSelectingFile) {
      dispatch(setSelectingFile(false));
    }
  }, [isSelectingFile, dispatch]);

  const onExpand = (newExpandedFiles: Key[]) => {
    dispatch(setExpandedSearchedFiles(newExpandedFiles));
  };

  const onFilterByFileOrFolder = (relativePath: string | undefined) => {
    dispatch(updateResourceFilter({...resourceFilter, fileOrFolderContainedIn: relativePath}));
  };

  const filterFilesByQuery = (node: FileEntry, queryRegExp: RegExp) => {
    if (node.text && node.isSupported && !node.isExcluded) {
      let matchLines;
      const matches = node.text.match(queryRegExp);
      const matchCount = matches?.length;
      if (matchCount) {
        matchLines = getMatchLines(node.text, matches);

        searchCounter.current = {
          filesCount: searchCounter.current.filesCount + 1,
          totalMatchCount: searchCounter.current.totalMatchCount + matchCount,
        };
      }

      return matches
        ? {
            ...node,
            matches,
            matchCount,
            matchLines,
          }
        : (null as unknown as FileEntry);
    }

    return null as unknown as FileEntry;
  };

  const saveQueryHistory = (query: string) => {
    const recentSearch = electronStore.get('appConfig.recentSearch') || [];
    if (!recentSearch.includes(query)) {
      electronStore.set('appConfig.recentSearch', [...recentSearch, query]);
    }
  };

  const findMatches = (query: string) => {
    searchCounter.current = {filesCount: 0, totalMatchCount: 0};
    if (!fileMap) return;
    // reset tree to its default state
    if (!query) {
      setSearchTree(null);
      setFindingMatches(false);
      return;
    }

    const queryRegExp = getRegexp(query, queryMatchParam);

    const filteredFileMap: FileEntry[] = Object.values(fileMap)
      .map(file => filterFilesByQuery(file, queryRegExp))
      .filter(v => Boolean(v));

    const treeData = createFilteredNode(filteredFileMap);

    setSearchTree(treeData);
    saveQueryHistory(query);
    setFindingMatches(false);
  };

  useEffect(() => {
    findMatches(searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryMatchParam, fileMap]);

  const handleSearchQueryChange = (e: {target: HTMLInputElement}) => {
    setFindingMatches(true);
    updateSearchQuery(e.target.value);

    debounceHandler.current && clearTimeout(debounceHandler.current);
    debounceHandler.current = setTimeout(() => {
      findMatches(e.target.value);
    }, 1000);
  };

  const toggleMatchParam = (param: keyof MatchParamProps) => {
    setFindingMatches(true);
    setQueryMatchParam(prevState => ({...prevState, [param]: !prevState[param]}));
  };

  const isReady = searchTree && !isFindingMatches;

  return (
    <S.FileTreeContainer id="AdvancedSearch">
      <TitleBar title="Advanced Search" closable />
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
        <S.RootFolderText>
          {isReady && (
            <S.MatchText id="search-count">
              {searchCounter.current.totalMatchCount} matches in {searchCounter.current.filesCount} files
            </S.MatchText>
          )}
          {!searchTree && !isFindingMatches && (
            <RecentSearch
              handleClick={query => {
                updateSearchQuery(query);
                findMatches(query);
              }}
            />
          )}
        </S.RootFolderText>
        {isFindingMatches && <S.Skeleton active />}

        {isReady && (
          <S.TreeDirectoryTree
            height={height - 2 * DEFAULT_PANE_TITLE_HEIGHT - 20}
            onSelect={onLineSelect}
            treeData={[searchTree]}
            ref={treeRef}
            expandedKeys={expandedFiles}
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
                onCreateFileFolder={onCreateFileFolder}
                onDuplicate={onDuplicate}
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
            switcherIcon={<DownOutlined />}
            icon={<></>}
          />
        )}
      </S.TreeContainer>
    </S.FileTreeContainer>
  );
};

export default SearchPane;
