import {memo} from 'react';

import {useAppSelector} from '@redux/hooks';

import {isDefined} from '@shared/utils/filter';
import {isEqual} from '@shared/utils/isEqual';

import TreeNodeFile from './TreeNodeFile';
import TreeNodeFolder from './TreeNodeFolder';

const FileSystemTreeNode: React.FC<{node: any}> = props => {
  const {node} = props;
  const isFolder = useAppSelector(state => isDefined(state.main.fileMap[node.key]?.children));
  return isFolder ? <TreeNodeFolder folderPath={node.key} /> : <TreeNodeFile filePath={node.key} />;
};

export default memo(FileSystemTreeNode, isEqual);
