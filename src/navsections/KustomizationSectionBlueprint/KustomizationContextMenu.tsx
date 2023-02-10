import React, {useCallback, useMemo} from 'react';

import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import path from 'path';
import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile} from '@redux/reducers/main';
import {setLeftMenuSelection} from '@redux/reducers/ui';
import {isInPreviewModeSelectorNew} from '@redux/selectors';
import {localResourceSelector} from '@redux/selectors/resourceSelectors';
import {getAbsoluteFilePath} from '@redux/services/fileEntry';
import {isResourceSelected} from '@redux/services/resource';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {ContextMenu, Dots} from '@atoms';

import {useCreate, useDuplicate, useFilterByFileOrFolder, useProcessing, useRename} from '@hooks/fileTreeHooks';

import {deleteEntity, dispatchDeleteAlert} from '@utils/files';
import {useSelectorWithRef} from '@utils/hooks';
import {isResourcePassingFilter} from '@utils/resources';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {ItemCustomComponentProps} from '@shared/models/navigator';
import {Colors} from '@shared/styles/colors';
import {showItemInFolder} from '@shared/utils/shell';

const StyledActionsMenuIconContainer = styled.span<{isSelected: boolean}>`
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
`;

const KustomizationContextMenu: React.FC<ItemCustomComponentProps> = props => {
  const {itemInstance} = props;

  const dispatch = useAppDispatch();
  const [, fileMapRef] = useSelectorWithRef(state => state.main.fileMap);
  const [resource, resourceRef] = useSelectorWithRef(state => localResourceSelector(state, itemInstance.id));

  const fileOrFolderContainedInFilter = useAppSelector(state => state.main.resourceFilter.fileOrFolderContainedIn);
  const filters = useAppSelector(state => state.main.resourceFilter);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const osPlatform = useAppSelector(state => state.config.osPlatform);
  const isKustomizationSelected = useAppSelector(state =>
    resource ? isResourceSelected(resource, state.main.selection) : false
  );

  const {onCreateResource} = useCreate();
  const {onDuplicate} = useDuplicate();
  const {onFilterByFileOrFolder} = useFilterByFileOrFolder();
  const {onRename} = useRename();

  const absolutePath = useMemo(
    () => (resource?.origin.filePath ? getAbsoluteFilePath(resource?.origin.filePath, fileMapRef.current) : undefined),
    [resource?.origin.filePath, fileMapRef]
  );

  const isRoot = useMemo(() => resource?.origin.filePath === ROOT_FILE_ENTRY, [resource?.origin.filePath]);
  const platformFileManagerName = useMemo(() => (osPlatform === 'darwin' ? 'Finder' : 'Explorer'), [osPlatform]);
  const targetFile = useMemo(
    () => (isRoot ? ROOT_FILE_ENTRY : resource?.origin.filePath.replace(path.sep, '')),
    [isRoot, resource?.origin.filePath]
  );
  const isPassingFilter = useMemo(
    () => (resource ? isResourcePassingFilter(resource, filters) : false),
    [filters, resource]
  );

  const refreshFolder = useCallback(() => setRootFolder(fileMapRef.current[ROOT_FILE_ENTRY].filePath), [fileMapRef]);
  const {onExcludeFromProcessing} = useProcessing(refreshFolder);

  const onClickShowFile = useCallback(() => {
    if (!resourceRef.current) {
      return;
    }

    dispatch(setLeftMenuSelection('explorer'));
    dispatch(selectFile({filePath: resourceRef.current.origin.filePath}));
  }, [dispatch, resourceRef]);

  const menuItems = useMemo(
    () => [
      {
        key: 'show_file',
        label: 'Go to file',
        disabled: isInPreviewMode,
        onClick: onClickShowFile,
      },
      {key: 'divider-1', type: 'divider'},
      {
        key: 'create_resource',
        label: 'Add Resource',
        disabled: true,
        onClick: () => {
          onCreateResource({targetFile});
        },
      },
      {key: 'divider-2', type: 'divider'},
      {
        key: 'filter_on_this_file',
        label:
          fileOrFolderContainedInFilter && resourceRef.current?.origin.filePath === fileOrFolderContainedInFilter
            ? 'Remove from filter'
            : 'Filter on this file',
        disabled: true,
        onClick: () => {
          if (
            isRoot ||
            (fileOrFolderContainedInFilter && resourceRef.current?.origin.filePath === fileOrFolderContainedInFilter)
          ) {
            onFilterByFileOrFolder(undefined);
          } else {
            onFilterByFileOrFolder(resourceRef.current?.origin.filePath);
          }
        },
      },
      {
        key: 'add_to_files_exclude',
        label: 'Add to Files: Exclude',
        disabled: isInPreviewMode,
        onClick: () => {
          resourceRef.current && onExcludeFromProcessing(resourceRef.current.origin.filePath);
        },
      },
      {key: 'divider-3', type: 'divider'},
      {
        key: 'copy_full_path',
        label: 'Copy Path',
        onClick: () => {
          if (!absolutePath) {
            return;
          }
          navigator.clipboard.writeText(absolutePath);
        },
      },
      {
        key: 'copy_relative_path',
        label: 'Copy Relative Path',
        onClick: () => {
          resourceRef.current && navigator.clipboard.writeText(resourceRef.current.origin.filePath);
        },
      },
      {key: 'divider-4', type: 'divider'},
      {
        key: 'duplicate_entity',
        label: 'Duplicate',
        disabled: isInPreviewMode,
        onClick: () => {
          if (!absolutePath) {
            return;
          }
          onDuplicate(absolutePath, path.basename(absolutePath), path.dirname(absolutePath));
        },
      },
      {
        key: 'rename_entity',
        label: 'Rename',
        disabled: isInPreviewMode,
        onClick: () => {
          if (!absolutePath) {
            return;
          }
          onRename(absolutePath, osPlatform);
        },
      },
      {
        key: 'delete_entity',
        label: 'Delete',
        disabled: isInPreviewMode,
        onClick: () => {
          Modal.confirm({
            title: `Are you sure you want to delete "${absolutePath ? path.basename(absolutePath) : undefined}"?`,
            icon: <ExclamationCircleOutlined />,
            onOk() {
              if (!absolutePath) {
                return;
              }
              deleteEntity(absolutePath, args => dispatchDeleteAlert(dispatch, args));
            },
          });
        },
      },
      {key: 'divider-5', type: 'divider'},
      {
        key: 'reveal_in_finder',
        label: `Reveal in ${platformFileManagerName}`,
        onClick: () => {
          if (!absolutePath) {
            return;
          }
          showItemInFolder(absolutePath);
        },
      },
    ],
    [
      isInPreviewMode,
      isRoot,
      absolutePath,
      fileOrFolderContainedInFilter,
      osPlatform,
      platformFileManagerName,
      targetFile,
      resourceRef,
      dispatch,
      onCreateResource,
      onFilterByFileOrFolder,
      onDuplicate,
      onRename,
      onExcludeFromProcessing,
      onClickShowFile,
    ]
  );

  if (!isPassingFilter) {
    return null;
  }

  return (
    <ContextMenu items={menuItems}>
      <StyledActionsMenuIconContainer isSelected={itemInstance.isSelected}>
        <Dots color={isKustomizationSelected ? Colors.blackPure : undefined} />
      </StyledActionsMenuIconContainer>
    </ContextMenu>
  );
};

export default KustomizationContextMenu;
