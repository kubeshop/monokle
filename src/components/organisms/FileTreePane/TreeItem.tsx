import React, {useCallback, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';

import {Menu, Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import path from 'path';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {useAppSelector} from '@redux/hooks';
import {isInPreviewModeSelector} from '@redux/selectors';
import {getHelmValuesFile} from '@redux/services/helm';
import {isKustomizationFile} from '@redux/services/kustomize';

import {Spinner} from '@components/atoms';
import Dots from '@components/atoms/Dots';
import ContextMenu from '@components/molecules/ContextMenu';

import {deleteEntity} from '@utils/files';
import {showItemInFolder} from '@utils/shell';

import Colors from '@styles/Colors';

import * as S from './Styled';
import {TreeItemProps} from './types';

function deleteEntityWizard(entityInfo: {entityAbsolutePath: string}, onOk: () => void, onCancel: () => void) {
  const title = `Are you sure you want to delete "${path.basename(entityInfo.entityAbsolutePath)}"?`;

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    onOk() {
      onOk();
    },
    onCancel() {
      onCancel();
    },
  });
}

export const TreeItem: React.FC<TreeItemProps> = props => {
  const {isExcluded, isFolder, isSupported, processingEntity, title, treeKey} = props;
  const {
    setProcessingEntity,
    onDelete,
    onRename,
    onExcludeFromProcessing,
    onIncludeToProcessing,
    onCreateFolder,
    onCreateResource,
    onFilterByFileOrFolder,
    onPreview,
  } = props;

  const [isTitleHovered, setTitleHoverState] = useState(false);

  const fileOrFolderContainedInFilter = useAppSelector(state => state.main.resourceFilter.fileOrFolderContainedIn);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const osPlatform = useAppSelector(state => state.config.osPlatform);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);

  const isFileSelected = useMemo(() => {
    return treeKey === selectedPath;
  }, [treeKey, selectedPath]);

  const getBasename = osPlatform === 'win32' ? path.win32.basename : path.basename;

  const isRoot = fileMap[ROOT_FILE_ENTRY].filePath === treeKey;
  const relativePath = isRoot ? getBasename(path.normalize(treeKey)) : treeKey;
  const absolutePath = isRoot
    ? fileMap[ROOT_FILE_ENTRY].filePath
    : path.join(fileMap[ROOT_FILE_ENTRY].filePath, treeKey);

  const target = isRoot ? ROOT_FILE_ENTRY : treeKey.replace(path.sep, '');

  const platformFilemanagerNames: {[name: string]: string} = {
    darwin: 'Finder',
  };

  const platformFilemanagerName = platformFilemanagerNames[osPlatform] || 'Explorer';

  const canPreview = useCallback(
    (entryPath: string): boolean => {
      const fileEntry = fileMap[entryPath];
      return (
        fileEntry &&
        (isKustomizationFile(fileEntry, resourceMap) || getHelmValuesFile(fileEntry, helmValuesMap) !== undefined)
      );
    },
    [fileMap, resourceMap, helmValuesMap]
  );

  const handleOnMouseEnter = () => setTitleHoverState(true);
  const handleOnMouseLeave = () => setTitleHoverState(false);
  const handlePrevie = (e: any) => {
    e.stopPropagation();
    canPreview(relativePath) && onPreview(relativePath);
  };
  const menu = (
    <Menu>
      {canPreview(relativePath) ? (
        <>
          <Menu.Item
            onClick={e => {
              e.domEvent.stopPropagation();
              onPreview(relativePath);
            }}
            key="preview"
          >
            Preview
          </Menu.Item>
          <S.ContextMenuDivider />
        </>
      ) : null}
      {isFolder ? (
        <>
          <Menu.Item
            disabled={isInPreviewMode}
            onClick={e => {
              e.domEvent.stopPropagation();
              onCreateFolder(absolutePath);
            }}
            key="create_directory"
          >
            New Folder
          </Menu.Item>
        </>
      ) : null}

      <Menu.Item
        disabled={isInPreviewMode || (!isFolder && (isExcluded || !isSupported))}
        onClick={e => {
          e.domEvent.stopPropagation();
          onCreateResource(isFolder ? {targetFolder: target} : {targetFile: target});
        }}
        key="create_resource"
      >
        {isFolder ? 'New Resource' : 'Add Resource'}
      </Menu.Item>
      <S.ContextMenuDivider />
      <Menu.Item
        key={`filter_on_this_${isFolder ? 'folder' : 'file'}`}
        disabled={isInPreviewMode || (!isFolder && (isExcluded || !isSupported))}
        onClick={e => {
          e.domEvent.stopPropagation();

          if (isRoot || (fileOrFolderContainedInFilter && relativePath === fileOrFolderContainedInFilter)) {
            onFilterByFileOrFolder(undefined);
          } else {
            onFilterByFileOrFolder(relativePath);
          }
        }}
      >
        {fileOrFolderContainedInFilter && relativePath === fileOrFolderContainedInFilter
          ? 'Remove from filter'
          : `Filter on this ${isFolder ? 'folder' : 'file'}`}
      </Menu.Item>
      {fileMap[ROOT_FILE_ENTRY].filePath !== treeKey ? (
        <>
          <Menu.Item
            disabled={isInPreviewMode || (!isFolder && !isSupported && !isExcluded)}
            onClick={e => {
              e.domEvent.stopPropagation();
              if (isExcluded) {
                onIncludeToProcessing(relativePath);
              } else {
                onExcludeFromProcessing(relativePath);
              }
            }}
            key="add_to_files_exclude"
          >
            {isExcluded ? 'Remove from' : 'Add to'} Files: Exclude
          </Menu.Item>
        </>
      ) : null}
      <S.ContextMenuDivider />
      <Menu.Item
        onClick={e => {
          e.domEvent.stopPropagation();
          navigator.clipboard.writeText(absolutePath);
        }}
        key="copy_full_path"
      >
        Copy Path
      </Menu.Item>
      <Menu.Item
        onClick={e => {
          e.domEvent.stopPropagation();

          navigator.clipboard.writeText(relativePath);
        }}
        key="copy_relative_path"
      >
        Copy Relative Path
      </Menu.Item>
      {fileMap[ROOT_FILE_ENTRY].filePath !== treeKey ? (
        <>
          <S.ContextMenuDivider />
          <Menu.Item
            disabled={isInPreviewMode}
            onClick={e => {
              e.domEvent.stopPropagation();
              onRename(absolutePath, osPlatform);
            }}
            key="rename_entity"
          >
            Rename
          </Menu.Item>
          <Menu.Item
            disabled={isInPreviewMode}
            key="delete_entity"
            onClick={e => {
              e.domEvent.stopPropagation();
              deleteEntityWizard(
                {entityAbsolutePath: absolutePath},
                () => {
                  setProcessingEntity({processingEntityID: treeKey, processingType: 'delete'});
                  deleteEntity(absolutePath, onDelete);
                },
                () => {}
              );
            }}
          >
            Delete
          </Menu.Item>
        </>
      ) : null}
      <S.ContextMenuDivider />
      <Menu.Item
        onClick={e => {
          e.domEvent.stopPropagation();
          showItemInFolder(absolutePath);
        }}
        key="reveal_in_finder"
      >
        Reveal in {platformFilemanagerName}
      </Menu.Item>
    </Menu>
  );

  return (
    <S.TreeTitleWrapper onMouseEnter={handleOnMouseEnter} onMouseLeave={handleOnMouseLeave}>
      <S.TreeTitleText>{title}</S.TreeTitleText>

      {processingEntity.processingEntityID === treeKey && processingEntity.processingType === 'delete' ? (
        <S.SpinnerWrapper>
          <Spinner />
        </S.SpinnerWrapper>
      ) : null}
      {isTitleHovered && !processingEntity.processingType ? (
        <>
          {canPreview(relativePath) && !isInPreviewMode && (
            <S.PreviewSpan isItemSelected={isTitleHovered || isFileSelected} onClick={handlePrevie}>
              Preview
            </S.PreviewSpan>
          )}
          <ContextMenu overlay={menu}>
            <div
              onClick={e => {
                e.stopPropagation();
              }}
            >
              <Dots color={isFileSelected ? Colors.blackPure : undefined} />
            </div>
          </ContextMenu>
        </>
      ) : null}
    </S.TreeTitleWrapper>
  );
};
