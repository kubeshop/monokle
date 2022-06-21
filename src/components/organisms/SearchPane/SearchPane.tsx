import React, {Key, useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';

import {Button, Input, Tabs} from 'antd';

import {DownOutlined} from '@ant-design/icons';

import {DEFAULT_PANE_TITLE_HEIGHT} from '@constants/constants';

import {FileEntry} from '@models/fileentry';

import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {openRenameEntityModal, setExpandedSearchedFiles, openCreateFileFolderModal} from '@redux/reducers/ui';
import {isInPreviewModeSelector} from '@redux/selectors';

import {TitleBar} from '@molecules';

import {useCreate, useDelete, useDuplicate, useFileSelect, useHighlightNode, usePreview} from '@hooks/fileTreeHooks';
import {highlightFileMatches, setSelectingFile, updateResourceFilter} from '@redux/reducers/main';

import electronStore from '@utils/electronStore';
import {MatchParamProps, filterFilesByQuery, getRegexp} from '@utils/getRegexp';

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
  const [replaceQuery, updateReplaceQuery] = useState<string>('');
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
  const onSelect = useFileSelect();
  const onPreview = usePreview();
  const {onDelete, processingEntity, setProcessingEntity} = useDelete();
  const {onDuplicate} = useDuplicate();
  const {onCreateResource} = useCreate();

  const treeRef = useRef<any>();
  const expandedFiles = useAppSelector(state => state.ui.leftMenu.expandedSearchedFiles);
  const {TabPane} = Tabs;

  const highlightFilePath = useHighlightNode(searchTree, treeRef, expandedFiles);

  const onCreateFileFolder = (absolutePath: string, type: 'file' | 'folder') => {
    dispatch(openCreateFileFolderModal({rootDir: absolutePath, type}));
  };

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
      .map(file => filterFilesByQuery(file, queryRegExp, searchCounter))
      .filter(v => Boolean(v)); // filter not supported files

    const treeData = createFilteredNode(filteredFileMap);

    setSearchTree(treeData);
    saveQueryHistory(query);
    setFindingMatches(false);
  };

  const onNodeSelect = (selectedKeysValue: React.Key[], info: any) => {
    let parentNode = info.node;
    if (info.node.parentKey) {
      parentNode = searchTree?.children.find(({key}) => info.node.parentKey === key);
    }
    const options = {
      currentMatchItem: info.node.matchItem || info.node.matchLines[0][0],
      matchLines: parentNode.matchLines,
    };
    onSelect(selectedKeysValue, info);
    dispatch(highlightFileMatches(options));
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

  const handleReplaceQuery = (e: {target: HTMLInputElement}) => {
    updateReplaceQuery(e.target.value);
  };

  const toggleMatchParam = (param: keyof MatchParamProps) => {
    setFindingMatches(true);
    setQueryMatchParam(prevState => ({...prevState, [param]: !prevState[param]}));
  };

  const isReady = searchTree && !isFindingMatches;

  return (
    <S.FileTreeContainer id="AdvancedSearch">
      <TitleBar title="Advanced Search" closable />
      <S.Tabs>
        <TabPane key="search" tab="Search">
          <S.TreeContainer>
            <S.Form>
              <S.SearchBox>
                <Input placeholder="Search anything..." value={searchQuery} onChange={handleSearchQueryChange} />
                <S.StyledButton
                  $isItemSelected={queryMatchParam.matchCase}
                  onClick={() => toggleMatchParam('matchCase')}
                >
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
            </S.Form>
            <S.RootFolderText>
              {isReady && (
                <S.MatchText id="search-count">
                  <p>
                    {searchCounter.current.totalMatchCount} matches in {searchCounter.current.filesCount} files
                  </p>
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
                onSelect={onNodeSelect}
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
        </TabPane>

        <TabPane key="FindReplace" tab="Find &#38; Replace">
          <S.TreeContainer>
            <S.Form>
              <S.Label>Find:</S.Label>
              <S.SearchBox>
                <Input value={searchQuery} onChange={handleSearchQueryChange} />
                <S.StyledButton
                  $isItemSelected={queryMatchParam.matchCase}
                  onClick={() => toggleMatchParam('matchCase')}
                >
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

              <S.Label>Replace:</S.Label>
              <S.SearchBox>
                <Input value={replaceQuery} onChange={handleReplaceQuery} />
              </S.SearchBox>
            </S.Form>
            <S.RootFolderText>
              {isReady && (
                <S.ResultContainer>
                  <S.MatchText id="search-count-replace">
                    <p>1 of {searchCounter.current.totalMatchCount}</p>
                    <span> View in Editor</span>
                  </S.MatchText>
                  <S.ButtonContainer>
                    <Button type="primary">Previous</Button>
                    <Button type="primary">Next</Button>
                  </S.ButtonContainer>
                </S.ResultContainer>
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
