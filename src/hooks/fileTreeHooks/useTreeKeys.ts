import {useMemo} from 'react';

import {TreeNode} from '@shared/models/explorer';

export function useTreeKeys(tree: TreeNode | null) {
  const allTreeKeys = useMemo(() => {
    if (!tree) return [];

    // The root element goes first anyway if tree exists
    const treeKeys: string[] = [tree.key];

    recursivelyGetAllTheKeys(tree.children, treeKeys);

    return treeKeys;
  }, [tree]);

  return allTreeKeys;
}

/**
 * Recursively finds all the keys and pushes them into array.
 */
const recursivelyGetAllTheKeys = (arr: TreeNode[], treeKeys: string[]) => {
  if (!arr) return;

  arr.forEach((data: TreeNode) => {
    const {children} = data;

    if (!children.length) return;

    treeKeys.push(data.key);

    recursivelyGetAllTheKeys(data.children, treeKeys);
  });
};
