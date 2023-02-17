import {orderBy} from 'lodash';

import {FileExplorerSortOrder} from '@shared/models/config';
import {TreeNode} from '@shared/models/explorer';

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
