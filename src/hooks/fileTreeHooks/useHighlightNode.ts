import {useCallback, useEffect, useState} from 'react';
import {useUpdateEffect} from 'react-use';

import {TreeNodeProps} from 'antd';

import path from 'path';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setExpandedFolders} from '@redux/reducers/ui';

import {TreeNode} from '@components/organisms/FileTreePane/types';

import {uniqueArr} from '@utils/index';

export const useHighlightNode = (tree: TreeNode | null, treeRef: TreeNodeProps, expandedFolders: React.Key[]) => {
  const [highlightNode, setHighlightNode] = useState<TreeNode>();
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // removes any highlight when a file is selected
    if (selectedPath && highlightNode) {
      highlightNode.highlight = false;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightNode]);

  useUpdateEffect(() => {
    if (leftMenuSelection !== 'search' && leftMenuSelection !== 'file-explorer') {
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

  const highlightFilePath = useCallback(
    (filePath: string) => {
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
    },
    [dispatch, expandedFolders, highlightNode, tree, treeRef]
  );

  return highlightFilePath;
};
