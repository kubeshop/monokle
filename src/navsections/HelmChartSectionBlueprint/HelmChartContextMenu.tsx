import {useCallback, useMemo} from 'react';

import {Menu, Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import path from 'path';
import styled from 'styled-components';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {ItemCustomComponentProps} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile, setSelectingFile} from '@redux/reducers/main';
import {setLeftMenuSelection} from '@redux/reducers/ui';
import {isInPreviewModeSelector} from '@redux/selectors';
import {getAbsoluteFilePath} from '@redux/services/fileEntry';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import ContextMenu from '@molecules/ContextMenu';

import {Dots} from '@atoms';

import {useCreate, useDuplicate, useFilterByFileOrFolder, useProcessing, useRename} from '@hooks/fileTreeHooks';

import {deleteEntity, dispatchDeleteAlert} from '@utils/files';
import {showItemInFolder} from '@utils/shell';

import Colors from '@styles/Colors';

const StyledActionsMenuIconContainer = styled.span<{isSelected: boolean}>`
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
`;

const HelmChartContextMenu: React.FC<ItemCustomComponentProps> = props => {
  const {itemInstance} = props;

  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const fileOrFolderContainedInFilter = useAppSelector(state => state.main.resourceFilter.fileOrFolderContainedIn);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const osPlatform = useAppSelector(state => state.config.osPlatform);
  const selectedPath = useAppSelector(state => state.main.selectedPath);

  const {onCreateResource} = useCreate();
  const {onDuplicate} = useDuplicate();
  const {onFilterByFileOrFolder} = useFilterByFileOrFolder();
  const {onRename} = useRename();

  const refreshFolder = useCallback(() => setRootFolder(fileMap[ROOT_FILE_ENTRY].filePath), [fileMap]);
  const {onExcludeFromProcessing} = useProcessing(refreshFolder);

  const helmValueItem = useMemo(() => helmValuesMap[itemInstance.id], [helmValuesMap, itemInstance.id]);
  const absolutePath = useMemo(
    () => getAbsoluteFilePath(helmValueItem.filePath, fileMap),
    [fileMap, helmValueItem.filePath]
  );
  const basename = useMemo(
    () => (osPlatform === 'win32' ? path.win32.basename(absolutePath) : path.basename(absolutePath)),
    [absolutePath, osPlatform]
  );
  const dirname = useMemo(
    () => (osPlatform === 'win32' ? path.win32.dirname(absolutePath) : path.dirname(absolutePath)),
    [absolutePath, osPlatform]
  );
  const isHelmValueSelected = useMemo(
    () => helmValueItem.filePath === selectedPath,
    [helmValueItem.filePath, selectedPath]
  );
  const isRoot = useMemo(() => helmValueItem.filePath === ROOT_FILE_ENTRY, [helmValueItem.filePath]);
  const platformFileManagerName = useMemo(() => (osPlatform === 'darwin' ? 'Finder' : 'Explorer'), [osPlatform]);
  const target = useMemo(
    () => (isRoot ? ROOT_FILE_ENTRY : helmValueItem.filePath.replace(path.sep, '')),
    [helmValueItem.filePath, isRoot]
  );

  const menuItems = useMemo(
    () => [
      {
        key: 'show_file',
        label: 'Go to file',
        disabled: isInPreviewMode,
        onClick: () => {
          if (!helmValueItem) {
            return;
          }

          dispatch(setLeftMenuSelection('file-explorer'));
          dispatch(setSelectingFile(true));
          dispatch(selectFile({filePath: helmValueItem.filePath}));
        },
      },
      {key: 'divider-1', type: 'divider'},
      {
        key: 'create_resource',
        label: 'Add Resource',
        disabled: true,
        onClick: () => {
          onCreateResource({targetFile: target});
        },
      },
      {key: 'divider-2', type: 'divider'},
      {
        key: 'filter_on_this_file',
        label:
          fileOrFolderContainedInFilter && helmValueItem.filePath === fileOrFolderContainedInFilter
            ? 'Remove from filter'
            : 'Filter on this file',
        disabled: true,
        onClick: () => {
          if (isRoot || (fileOrFolderContainedInFilter && helmValueItem.filePath === fileOrFolderContainedInFilter)) {
            onFilterByFileOrFolder(undefined);
          } else {
            onFilterByFileOrFolder(helmValueItem.filePath);
          }
        },
      },
      {
        key: 'add_to_files_exclude',
        label: 'Add to Files: Exclude',
        disabled: true,
        onClick: () => {
          onExcludeFromProcessing(helmValueItem.filePath);
        },
      },
      {key: 'divider-3', type: 'divider'},
      {
        key: 'copy_full_path',
        label: 'Copy Path',
        onClick: () => {
          navigator.clipboard.writeText(absolutePath);
        },
      },
      {
        key: 'copy_relative_path',
        label: 'Copy Relative Path',
        onClick: () => {
          navigator.clipboard.writeText(helmValueItem.filePath);
        },
      },
      {key: 'divider-4', type: 'divider'},
      {
        key: 'duplicate_entity',
        label: 'Duplicate',
        disabled: isInPreviewMode,
        onClick: () => {
          onDuplicate(absolutePath, basename, dirname);
        },
      },
      {
        key: 'rename_entity',
        label: 'Rename',
        disabled: isInPreviewMode,
        onClick: () => {
          onRename(absolutePath, osPlatform);
        },
      },
      {
        key: 'delete_entity',
        label: 'Delete',
        disabled: isInPreviewMode,
        onClick: () => {
          Modal.confirm({
            title: `Are you sure you want to delete "${basename}"?`,
            icon: <ExclamationCircleOutlined />,
            onOk() {
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
          showItemInFolder(absolutePath);
        },
      },
    ],
    [
      absolutePath,
      basename,
      dirname,
      dispatch,
      fileOrFolderContainedInFilter,
      helmValueItem,
      isInPreviewMode,
      isRoot,
      onCreateResource,
      onDuplicate,
      onExcludeFromProcessing,
      onFilterByFileOrFolder,
      onRename,
      osPlatform,
      platformFileManagerName,
      target,
    ]
  );

  return (
    <ContextMenu overlay={<Menu items={menuItems} />}>
      <StyledActionsMenuIconContainer isSelected={itemInstance.isSelected}>
        <Dots color={isHelmValueSelected ? Colors.blackPure : undefined} />
      </StyledActionsMenuIconContainer>
    </ContextMenu>
  );
};

export default HelmChartContextMenu;
