import {useMemo} from 'react';

import {pickBy} from 'lodash';
import {basename} from 'path';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {FileMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';

import {useAppSelector} from '@redux/hooks';
import {getChildFilePath} from '@redux/services/fileEntry';

const createNode = (fileEntry: FileEntry, fileMap: FileMapType, rootFolderName: string) => {
  const isRoot = fileEntry.name === ROOT_FILE_ENTRY;
  const filePath = isRoot ? ROOT_FILE_ENTRY : fileEntry.filePath;
  const name = isRoot ? rootFolderName : fileEntry.name;

  const node: any = {
    value: filePath,
    title: name,
    label: filePath,
    children: [],
  };

  if (fileEntry.children?.length) {
    node.children = fileEntry.children
      .map(child => fileMap[getChildFilePath(child, fileEntry, fileMap)])
      .filter(childEntry => childEntry)
      .map(childEntry => createNode(childEntry, fileMap, rootFolderName));
  }

  return node;
};

export const useFolderTreeSelectData = () => {
  const fileMap = useAppSelector(state => state.main.fileMap);

  const rootFolderName = useMemo(() => {
    return fileMap[ROOT_FILE_ENTRY] ? basename(fileMap[ROOT_FILE_ENTRY].filePath) : ROOT_FILE_ENTRY;
  }, [fileMap]);

  const rootFileEntry = fileMap[ROOT_FILE_ENTRY];
  const treeData = createNode(
    rootFileEntry,
    pickBy(fileMap, entry => entry.children),
    rootFolderName
  );

  return treeData;
};
