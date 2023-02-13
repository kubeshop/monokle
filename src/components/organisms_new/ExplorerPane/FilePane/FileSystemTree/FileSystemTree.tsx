import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {useMeasure} from 'react-use';

import {DataNode} from 'antd/lib/tree';

import fastDeepEqual from 'fast-deep-equal';
import path from 'path';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile} from '@redux/reducers/main';
import {selectedFilePathSelector} from '@redux/selectors';

import {getAllParentFolderPaths, isFileEntryDisabled} from '@utils/files';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {FileMapType} from '@shared/models/appState';
import {isFileSelection} from '@shared/models/selection';
import {isDefined} from '@shared/utils/filter';

import * as S from './FileSystemTree.styled';
import FileSystemTreeNode from './TreeNode';

const FileSystemTree: React.FC = () => {
  const dispatch = useAppDispatch();
  const [containerRef, {height: containerHeight}] = useMeasure<HTMLDivElement>();
  const selectedFilePath = useAppSelector(selectedFilePathSelector);
  const firstHighlightedFile = useAppSelector(state => state.main.highlights.find(isFileSelection));
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const expandedKeysRef = useRef(expandedKeys);
  expandedKeysRef.current = expandedKeys;
  const treeRef = useRef<any>(null);

  const treeData = useAppSelector(state => {
    const rootEntry = state.main.fileMap[ROOT_FILE_ENTRY];

    const rootFileNodes = createFileNodes(path.sep, state.main.fileMap);

    return [
      ...(rootEntry?.children
        ?.map(folderPath => createFolderTree(`${path.sep}${folderPath}`, state.main.fileMap))
        .filter(isDefined) || []),
      ...rootFileNodes,
    ];
  }, fastDeepEqual);

  useEffect(() => {
    if (!firstHighlightedFile) {
      return;
    }

    const parentFolderPaths = getAllParentFolderPaths(firstHighlightedFile.filePath);
    setExpandedKeys([...new Set([...expandedKeysRef.current, ...parentFolderPaths])]);
  }, [firstHighlightedFile]);

  useLayoutEffect(() => {
    if (!firstHighlightedFile) {
      return;
    }
    treeRef.current?.scrollTo({key: firstHighlightedFile.filePath});
  }, [firstHighlightedFile]);

  return (
    <S.TreeContainer ref={containerRef}>
      <S.TreeDirectoryTree
        $isHighlightSelection={Boolean(firstHighlightedFile)}
        ref={treeRef}
        expandedKeys={expandedKeys}
        onExpand={keys => setExpandedKeys(keys)}
        treeData={treeData}
        height={containerHeight}
        titleRender={node => <FileSystemTreeNode node={node} />}
        selectedKeys={
          selectedFilePath ? [selectedFilePath] : firstHighlightedFile ? [firstHighlightedFile.filePath] : []
        }
        showIcon
        showLine={{showLeafIcon: false}}
        virtual
        onClick={(mouseEvent, nodeEvent) => {
          mouseEvent.preventDefault();
          if (typeof nodeEvent.key === 'string') {
            dispatch(selectFile({filePath: nodeEvent.key}));
          }
        }}
      />
    </S.TreeContainer>
  );
};

function createFileNodes(folderPath: string, fileMap: FileMapType) {
  const fileEntries = Object.values(fileMap).filter(entry => {
    const entryFolderPath = path.dirname(entry.filePath);
    return folderPath === entryFolderPath && !isDefined(entry.children);
  });

  const fileNodes: DataNode[] = fileEntries.map(entry => ({
    key: entry.filePath,
    title: path.basename(entry.filePath),
    isLeaf: true,
    disabled: isFileEntryDisabled(entry),
  }));

  return fileNodes;
}

function createFolderTree(folderPath: string, fileMap: FileMapType) {
  const folderEntry = fileMap[folderPath];
  if (!folderEntry || !isDefined(folderEntry.children)) {
    return undefined;
  }

  const fileNodes = createFileNodes(folderPath, fileMap);

  const treeNode: DataNode = {
    key: folderEntry.filePath,
    title: path.basename(folderEntry.filePath),
    children: [
      ...(folderEntry.children
        ?.map(childPath => createFolderTree(path.join(folderPath, childPath), fileMap))
        .filter(isDefined) || []),
      ...fileNodes,
    ],
    disabled: isFileEntryDisabled(folderEntry),
  };
  return treeNode;
}

export default FileSystemTree;
