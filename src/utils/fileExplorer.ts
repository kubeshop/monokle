import {DataNode} from 'antd/lib/tree';

import {orderBy} from 'lodash';
import path from 'path';

import {fileIsExcluded} from '@redux/services/fileEntry';

import {FileMapType} from '@shared/models/appState';
import {FileExplorerSortOrder, ProjectConfig} from '@shared/models/config';
import {TreeNode} from '@shared/models/explorer';
import {isDefined} from '@shared/utils/filter';

import {isFileEntryDisabled} from './files';

const sortTree = (currentRoot: TreeNode, type: 'folders' | 'files') => {
  if (currentRoot.children) {
    currentRoot.children = orderBy(currentRoot.children, 'isFolder', type === 'folders' ? 'asc' : 'desc');

    currentRoot.children.forEach(child => {
      sortTree(child, type);
    });
  }
};

export const sortFoldersFiles = (type: FileExplorerSortOrder, tree: TreeNode) => {
  const treeClone = {...tree};

  switch (type) {
    case 'files':
      sortTree(treeClone, 'files');
      return treeClone;
    case 'folders':
      sortTree(treeClone, 'folders');
      return treeClone;
    case 'mixed':
      return treeClone;
    default:
      return treeClone;
  }
};

export const sortNodes = (
  folderNodes: DataNode[],
  fileNodes: DataNode[],
  fileExplorerSortOrder: FileExplorerSortOrder
) => {
  if (fileExplorerSortOrder === 'folders') {
    return [...folderNodes, ...fileNodes];
  }

  if (fileExplorerSortOrder === 'files') {
    return [...fileNodes, ...folderNodes];
  }

  return [...folderNodes, ...fileNodes].sort((a, b) => a.key.toLocaleString().localeCompare(b.key.toLocaleString()));
};

export function createFileNodes(folderPath: string, fileMap: FileMapType) {
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

export function createFolderTree(
  folderPath: string,
  fileMap: FileMapType,
  fileExplorerSortOrder: FileExplorerSortOrder,
  projectConfig: ProjectConfig
) {
  const folderEntry = fileMap[folderPath];
  if (!folderEntry || !isDefined(folderEntry.children)) {
    return undefined;
  }

  const fileNodes = createFileNodes(folderPath, fileMap);
  const folderNodes =
    folderEntry.children
      ?.map(childPath =>
        createFolderTree(path.join(folderPath, childPath), fileMap, fileExplorerSortOrder, projectConfig)
      )
      .filter(isDefined) || [];

  let children: DataNode[] = sortNodes(folderNodes, fileNodes, fileExplorerSortOrder);
  const isExcluded = fileIsExcluded(folderEntry.filePath, projectConfig);

  const treeNode: DataNode | any = {
    key: folderEntry.filePath,
    title: path.basename(folderEntry.filePath),
    children,
    selectable: false,
    isExcluded,
  };

  return treeNode;
}
