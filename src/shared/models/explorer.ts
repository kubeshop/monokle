import {Dispatch, SetStateAction} from 'react';

import {DataNode} from 'antd/lib/tree';

// Props injected by Collapse when it clones the Panel
export type InjectedPanelProps = {
  isActive?: boolean;
  panelKey?: string;
};

export type ProcessingEntity = {
  processingEntityID?: string;
  processingType?: 'delete' | 'rename';
};

export type TreeNode = {
  key: string;
  title: React.ReactNode;
  children: TreeNode[];
  highlight: boolean;
  extension: string;
  isTextExtension: boolean;
  isFolder?: boolean;
  text?: string;
  /**
   * Whether the TreeNode has children
   */
  isLeaf?: boolean;
  icon?: React.ReactNode;
  isExcluded?: boolean;
  isSupported?: boolean;
  filePath: string;
  className?: string;
};

export type TreeItemProps = {
  title: React.ReactNode | ((data: DataNode) => React.ReactNode);
  treeKey: string;
  parentKey?: string;
  setProcessingEntity: Dispatch<SetStateAction<ProcessingEntity>>;
  processingEntity: ProcessingEntity;
  onDuplicate: (absolutePath: string, entityName: string, dirName: string) => void;
  onRename: (absolutePath: string, osPlatform: NodeJS.Platform) => void;
  onCreateFileFolder: (absolutePath: string, type: 'file' | 'folder') => void;
  onExcludeFromProcessing?: (relativePath: string) => void;
  onIncludeToProcessing?: (relativePath: string) => void;
  onCreateResource: (params: {targetFolder?: string; targetFile?: string}) => void;
  onFilterByFileOrFolder: (relativePath: string | undefined) => void;
  onPreview: (relativePath: string) => void;
  isExcluded?: boolean;
  isSupported?: boolean;
  isFolder?: boolean;
  isTextExtension?: boolean;
};
