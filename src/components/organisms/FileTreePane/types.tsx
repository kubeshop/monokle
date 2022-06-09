import {Dispatch, SetStateAction} from 'react';

import {DataNode} from 'antd/lib/tree';

import {DeleteEntityCallback} from '@utils/files';

export interface ProcessingEntity {
  processingEntityID?: string;
  processingType?: 'delete' | 'rename';
}

export interface TreeItemProps {
  title: React.ReactNode | ((data: DataNode) => React.ReactNode);
  treeKey: string;
  parentKey?: string;
  setProcessingEntity: Dispatch<SetStateAction<ProcessingEntity>>;
  processingEntity: ProcessingEntity;
  onDuplicate: (absolutePath: string, entityName: string, dirName: string) => void;
  onDelete: (args: DeleteEntityCallback) => void;
  onRename: (absolutePath: string, osPlatform: NodeJS.Platform) => void;
  onExcludeFromProcessing: (relativePath: string) => void;
  onIncludeToProcessing: (relativePath: string) => void;
  onCreateFileFolder: (absolutePath: string, type: 'file' | 'folder') => void;
  onCreateResource: (params: {targetFolder?: string; targetFile?: string}) => void;
  onFilterByFileOrFolder: (relativePath: string | undefined) => void;
  onPreview: (relativePath: string) => void;
  isExcluded?: boolean;
  isSupported?: boolean;
  isFolder?: Boolean;
}

export interface MatchLine {
  key: string;
  parentKey?: string;
  title: React.ReactNode;
}

export interface TreeNode {
  key: string;
  title: React.ReactNode;
  children: TreeNode[];
  highlight: boolean;
  isFolder?: boolean;
  text?: string;
  /**
   * Whether the TreeNode has children
   */
  isLeaf?: boolean;
  icon?: React.ReactNode;
  isExcluded?: boolean;
  isSupported?: boolean;
}

export interface FilterTreeNode extends Omit<TreeNode, 'children'> {
  children: MatchLine[];
  matchCount?: number;
  matches?: RegExpMatchArray | null;
}
