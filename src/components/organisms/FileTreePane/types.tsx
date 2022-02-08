import {Dispatch, SetStateAction} from 'react';

import {DeleteEntityCallback} from '@utils/files';

export interface ProcessingEntity {
  processingEntityID?: string;
  processingType?: 'delete' | 'rename';
}

export interface TreeItemProps {
  title: React.ReactNode;
  treeKey: string;
  setProcessingEntity: Dispatch<SetStateAction<ProcessingEntity>>;
  processingEntity: ProcessingEntity;
  onDelete: (args: DeleteEntityCallback) => void;
  onRename: (absolutePath: string, osPlatform: NodeJS.Platform) => void;
  onExcludeFromProcessing: (relativePath: string) => void;
  onIncludeToProcessing: (relativePath: string) => void;
  onCreateFolder: (absolutePath: string) => void;
  onCreateResource: (params: {targetFolder?: string; targetFile?: string}) => void;
  onFilterByFileOrFolder: (relativePath: string | undefined) => void;
  onPreview: (relativePath: string) => void;
  isExcluded?: boolean;
  isSupported?: boolean;
  isFolder?: Boolean;
}

export interface TreeNode {
  key: string;
  title: React.ReactNode;
  children: TreeNode[];
  highlight: boolean;
  isFolder?: boolean;
  /**
   * Whether the TreeNode has children
   */
  isLeaf?: boolean;
  icon?: React.ReactNode;
  isExcluded?: boolean;
  isSupported?: boolean;
}
