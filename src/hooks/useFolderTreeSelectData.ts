import {useMemo} from 'react';

import {pickBy} from 'lodash';
import {basename} from 'path';

import {useAppSelector} from '@redux/hooks';
import {getChildFilePath} from '@redux/services/fileEntry';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {FileMapType} from '@shared/models/appState';
import {FileEntry} from '@shared/models/fileEntry';

const createNode = (fileEntry: FileEntry, fileMap: FileMapType, rootFolderName: string, isGitFileMap?: boolean) => {
  const isRoot = fileEntry?.name === ROOT_FILE_ENTRY;
  const filePath = isRoot ? ROOT_FILE_ENTRY : fileEntry?.filePath;
  const name = isRoot ? rootFolderName : fileEntry?.name;

  const node: any = {
    value: filePath,
    title: name,
    label: filePath === ROOT_FILE_ENTRY ? name : filePath,
    children: [],
  };

  if (fileEntry?.children?.length) {
    node.children = fileEntry.children
      .map(child => (isGitFileMap ? fileMap[child] : fileMap[getChildFilePath(child, fileEntry, fileMap)]))
      .filter(childEntry => childEntry)
      .map(childEntry => createNode(childEntry, fileMap, rootFolderName, isGitFileMap));
  }

  return node;
};

export const useFileFolderTreeSelectData = (type: 'folder' | 'all', gitFileMap?: FileMapType) => {
  const fileMap = useAppSelector(state => gitFileMap || state.main.fileMap);
  const rootFolderName = useMemo(() => {
    return gitFileMap
      ? ROOT_FILE_ENTRY
      : fileMap[ROOT_FILE_ENTRY]
      ? basename(fileMap[ROOT_FILE_ENTRY].filePath)
      : ROOT_FILE_ENTRY;
  }, [fileMap, gitFileMap]);

  const rootFileEntry = fileMap[ROOT_FILE_ENTRY];

  const treeData = createNode(
    rootFileEntry,
    type === 'all' ? fileMap : pickBy(fileMap, entry => entry.children),
    rootFolderName,
    Boolean(gitFileMap)
  );

  return treeData;
};
