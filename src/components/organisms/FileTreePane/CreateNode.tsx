import {Tooltip} from 'antd';

import path from 'path';
import textExtensions from 'text-extensions';

import {ADDITIONAL_SUPPORTED_FILES, TOOLTIP_DELAY} from '@constants/constants';

import {getChildFilePath, getResourcesForPath} from '@redux/services/fileEntry';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {FileMapType} from '@shared/models/appState';
import {FileEntry} from '@shared/models/fileEntry';
import {ResourceMap} from '@shared/models/k8sResource';

import {TreeNode} from './types';

import * as S from './styled';

export const createNode = (
  fileEntry: FileEntry,
  fileMap: FileMapType,
  resourceMap: ResourceMap,
  hideExcludedFilesInFileExplorer: boolean,
  hideUnsupportedFilesInFileExplorer: boolean,
  fileOrFolderContainedInFilter: string | undefined,
  rootFolderName: string
): TreeNode => {
  const resources = getResourcesForPath(fileEntry?.filePath, resourceMap);
  const root = fileMap[ROOT_FILE_ENTRY];
  const isRoot = fileEntry.name === ROOT_FILE_ENTRY;
  const key = isRoot ? ROOT_FILE_ENTRY : fileEntry.filePath;
  const name = isRoot ? rootFolderName : fileEntry.name;
  const fileExtension = fileEntry.extension.split('.').join('');
  const isTextExtension = textExtensions.some(supportedExtension => supportedExtension === fileExtension);

  const isSupported =
    (fileEntry.isSupported || fileEntry.children || isTextExtension || ADDITIONAL_SUPPORTED_FILES.includes(name)) &&
    (fileOrFolderContainedInFilter ? fileEntry.filePath.startsWith(fileOrFolderContainedInFilter) : true);

  const node: TreeNode = {
    key,
    title: (
      <S.NodeContainer>
        <S.NodeTitleContainer>
          <Tooltip
            overlayStyle={{fontSize: '12px', wordBreak: 'break-all'}}
            mouseEnterDelay={TOOLTIP_DELAY}
            title={isRoot ? fileEntry.filePath : path.join(root.filePath, fileEntry.filePath)}
            placement="bottom"
          >
            <span
              className={
                fileEntry.isExcluded
                  ? 'excluded-file-entry-name'
                  : isSupported
                  ? 'file-entry-name'
                  : 'not-supported-file-entry-name'
              }
            >
              {name}
            </span>
          </Tooltip>
          {resources.length > 0 ? (
            <Tooltip title={`${resources.length} resource${resources.length !== 1 ? 's' : ''} in this file`}>
              <S.NumberOfResources className="file-entry-nr-of-resources">{resources.length}</S.NumberOfResources>
            </Tooltip>
          ) : null}
        </S.NodeTitleContainer>
      </S.NodeContainer>
    ),
    children: [],
    highlight: false,
    isExcluded: fileEntry.isExcluded,
    isSupported,
    filePath: fileEntry.filePath,
    extension: fileEntry.extension,
    isTextExtension,
    className: !isSupported ? 'ant-tree-treenode-not-supported' : '',
  };

  if (fileEntry.children) {
    if (fileEntry.children.length) {
      node.children = fileEntry.children
        .map(child => fileMap[getChildFilePath(child, fileEntry, fileMap)])
        .filter(childEntry => childEntry)
        .map(childEntry =>
          createNode(
            childEntry,
            fileMap,
            resourceMap,
            hideExcludedFilesInFileExplorer,
            hideUnsupportedFilesInFileExplorer,
            fileOrFolderContainedInFilter,
            rootFolderName
          )
        )
        .filter(childEntry => {
          if (!hideExcludedFilesInFileExplorer) {
            return childEntry;
          }

          return !childEntry.isExcluded;
        })
        .filter(childEntry => {
          if (!hideUnsupportedFilesInFileExplorer || childEntry.isFolder) {
            return childEntry;
          }

          return childEntry.isSupported;
        });
    }
    node.isFolder = true;
  } else {
    node.isLeaf = true;
  }

  return node;
};
