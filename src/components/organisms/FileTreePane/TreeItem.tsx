import React, {useCallback, useMemo, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {useSelector} from 'react-redux';

import {Menu, Modal, Tooltip} from 'antd';

import {ExclamationCircleOutlined, EyeOutlined} from '@ant-design/icons';

import path from 'path';

import {ROOT_FILE_ENTRY, TOOLTIP_DELAY} from '@constants/constants';
import hotkeys from '@constants/hotkeys';

import {useAppSelector} from '@redux/hooks';
import {isInPreviewModeSelector} from '@redux/selectors';
import {getHelmValuesFile, isHelmChartFile, isHelmValuesFile} from '@redux/services/helm';
import {isKustomizationFile} from '@redux/services/kustomize';

import {Dots, Spinner} from '@atoms';

import ContextMenu from '@components/molecules/ContextMenu';

import {defineHotkey} from '@utils/defineHotkey';
import {deleteEntity} from '@utils/files';
import {showItemInFolder} from '@utils/shell';

import Colors from '@styles/Colors';

import {TreeItemProps} from './types';

import * as S from './styled';

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

const TreeItem: React.FC<TreeItemProps> = props => {
  const {isExcluded, isFolder, isSupported, processingEntity, title, treeKey, parentKey} = props;
  const {
    setProcessingEntity,
    onDuplicate,
    onDelete,
    onRename,
    onExcludeFromProcessing,
    onIncludeToProcessing,
    onCreateFileFolder,
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
  const getDirname = osPlatform === 'win32' ? path.win32.dirname : path.dirname;

  const isRoot = treeKey === ROOT_FILE_ENTRY;
  const root = fileMap[ROOT_FILE_ENTRY];
  const relativePath = isRoot ? getBasename(path.normalize(treeKey)) : treeKey;
  const absolutePath = isRoot ? root.filePath : path.join(root.filePath, treeKey);

  const target = isRoot ? ROOT_FILE_ENTRY : treeKey.replace(path.sep, '');

  const platformFilemanagerNames: {[name: string]: string} = {
    darwin: 'Finder',
  };

  const platformFilemanagerName = platformFilemanagerNames[osPlatform] || 'Explorer';

  useHotkeys(
    defineHotkey(hotkeys.DELETE_RESOURCE.key),
    () => {
      if (treeKey === selectedPath) {
        deleteEntityWizard(
          {entityAbsolutePath: absolutePath},
          () => {
            setProcessingEntity({processingEntityID: selectedPath, processingType: 'delete'});
            deleteEntity(absolutePath, onDelete);
          },
          () => {}
        );
      }
    },
    [selectedPath]
  );

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
  const handlePreview = (e: any) => {
    e.stopPropagation();
    canPreview(relativePath) && onPreview(relativePath);
  };

  const menuItems = [
    ...(canPreview(relativePath)
      ? [
          {
            key: 'preview',
            label: 'Preview',
            onClick: (e: any) => {
              e.domEvent.stopPropagation();
              onPreview(relativePath);
            },
          },
          {key: 'divider-preview', type: 'divider'},
        ]
      : []),
    ...(isFolder
      ? [
          {
            key: 'create_directory',
            label: 'New Folder',
            disabled: isInPreviewMode,
            onClick: (e: any) => {
              e.domEvent.stopPropagation();
              onCreateFileFolder(absolutePath, 'folder');
            },
          },
          {
            key: 'create_file',
            label: 'New File',
            disabled: isInPreviewMode,
            onClick: (e: any) => {
              e.domEvent.stopPropagation();
              onCreateFileFolder(absolutePath, 'file');
            },
          },
        ]
      : []),
    {
      key: 'create_resource',
      label: isFolder ? 'New Resource' : 'Add Resource',
      disabled:
        isInPreviewMode ||
        isHelmChartFile(relativePath) ||
        isHelmValuesFile(relativePath) ||
        (!isFolder && (isExcluded || !isSupported)),
      onClick: (e: any) => {
        e.domEvent.stopPropagation();
        onCreateResource(isFolder ? {targetFolder: target} : {targetFile: target});
      },
    },
    {key: 'divider-1', type: 'divider'},
    {
      key: `filter_on_this_${isFolder ? 'folder' : 'file'}`,
      label:
        fileOrFolderContainedInFilter && relativePath === fileOrFolderContainedInFilter
          ? 'Remove from filter'
          : `Filter on this ${isFolder ? 'folder' : 'file'}`,
      disabled: isInPreviewMode || (!isFolder && (isExcluded || !isSupported)),
      onClick: (e: any) => {
        e.domEvent.stopPropagation();

        if (isRoot || (fileOrFolderContainedInFilter && relativePath === fileOrFolderContainedInFilter)) {
          onFilterByFileOrFolder(undefined);
        } else {
          onFilterByFileOrFolder(relativePath);
        }
      },
    },
    ...(fileMap[ROOT_FILE_ENTRY].filePath !== treeKey
      ? [
          {
            key: 'add_to_files_exclude',
            label: `${isExcluded ? 'Remove from' : 'Add to'} Files: Exclude`,
            disabled: isInPreviewMode || (!isFolder && !isSupported && !isExcluded),
            onClick: (e: any) => {
              e.domEvent.stopPropagation();
              if (isExcluded) {
                onIncludeToProcessing(relativePath);
              } else {
                onExcludeFromProcessing(relativePath);
              }
            },
          },
        ]
      : []),
    {key: 'divider-2', type: 'divider'},
    {
      key: 'copy_full_path',
      label: 'Copy Path',
      onClick: (e: any) => {
        e.domEvent.stopPropagation();
        navigator.clipboard.writeText(absolutePath);
      },
    },
    {
      key: 'copy_relative_path',
      label: 'Copy Relative Path',
      onClick: (e: any) => {
        e.domEvent.stopPropagation();
        navigator.clipboard.writeText(relativePath);
      },
    },
    ...(fileMap[ROOT_FILE_ENTRY].filePath !== treeKey
      ? [
          {key: 'divider-3', type: 'divider'},
          {
            key: 'duplicate_entity',
            label: 'Duplicate',
            disabled: isInPreviewMode,
            onClick: (e: any) => {
              e.domEvent.stopPropagation();
              onDuplicate(absolutePath, getBasename(absolutePath), getDirname(absolutePath));
            },
          },
          {
            key: 'rename_entity',
            label: 'Rename',
            disabled: isInPreviewMode,
            onClick: (e: any) => {
              e.domEvent.stopPropagation();
              onRename(absolutePath, osPlatform);
            },
          },
          {
            key: 'delete_entity',
            label: 'Delete',
            disabled: isInPreviewMode,
            onClick: (e: any) => {
              e.domEvent.stopPropagation();
              deleteEntityWizard(
                {entityAbsolutePath: absolutePath},
                () => {
                  setProcessingEntity({processingEntityID: treeKey, processingType: 'delete'});
                  deleteEntity(absolutePath, onDelete);
                },
                () => {}
              );
            },
          },
        ]
      : []),
    {key: 'divider-4', type: 'divider'},
    {
      key: 'reveal_in_finder',
      label: `  Reveal in ${platformFilemanagerName}`,
      onClick: (e: any) => {
        e.domEvent.stopPropagation();
        showItemInFolder(absolutePath);
      },
    },
  ];

  return (
    <ContextMenu overlay={<Menu items={menuItems} />} triggerOnRightClick>
      <S.TreeTitleWrapper onMouseEnter={handleOnMouseEnter} onMouseLeave={handleOnMouseLeave}>
        <Tooltip
          overlayStyle={parentKey ? {display: 'none'} : {}}
          mouseEnterDelay={TOOLTIP_DELAY}
          title={absolutePath}
          placement="bottom"
        >
          <S.TitleWrapper>
            <S.TreeTitleText>{title as React.ReactNode}</S.TreeTitleText>
            {canPreview(relativePath) && (
              <EyeOutlined style={{color: isFileSelected ? Colors.blackPure : Colors.grey7}} />
            )}
          </S.TitleWrapper>
        </Tooltip>
        {processingEntity.processingEntityID === treeKey && processingEntity.processingType === 'delete' && (
          <S.SpinnerWrapper>
            <Spinner />
          </S.SpinnerWrapper>
        )}
        {isTitleHovered && !processingEntity.processingType ? (
          <S.ActionsWrapper>
            {canPreview(relativePath) && (
              <S.PreviewButton
                type="text"
                size="small"
                disabled={isInPreviewMode}
                $isItemSelected={isFileSelected}
                onClick={handlePreview}
              >
                Preview
              </S.PreviewButton>
            )}
            <ContextMenu overlay={<Menu items={menuItems} />}>
              <div
                onClick={e => {
                  e.stopPropagation();
                }}
              >
                <Dots color={isFileSelected ? Colors.blackPure : undefined} />
              </div>
            </ContextMenu>
          </S.ActionsWrapper>
        ) : null}
      </S.TreeTitleWrapper>
    </ContextMenu>
  );
};

export default TreeItem;
