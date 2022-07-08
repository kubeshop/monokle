import React, {useMemo} from 'react';

import {Menu, Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import path from 'path';
import styled from 'styled-components';

import {ItemCustomComponentProps} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile, setSelectingFile} from '@redux/reducers/main';
import {setLeftMenuSelection} from '@redux/reducers/ui';
import {isInPreviewModeSelector} from '@redux/selectors';
import {getAbsoluteFilePath} from '@redux/services/fileEntry';

import {Dots} from '@atoms';

import ContextMenu from '@components/molecules/ContextMenu';

import {useDuplicate, useRename} from '@hooks/fileTreeHooks';

import {deleteEntity, dispatchDeleteAlert} from '@utils/files';
import {showItemInFolder} from '@utils/shell';

import Colors from '@styles/Colors';

const StyledActionsMenuIconContainer = styled.span<{isSelected: boolean}>`
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
`;

const KustomizationContextMenu: React.FC<ItemCustomComponentProps> = props => {
  const {itemInstance} = props;

  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const osPlatform = useAppSelector(state => state.config.osPlatform);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);

  const {onDuplicate} = useDuplicate();
  const {onRename} = useRename();

  const isResourceSelected = useMemo(() => itemInstance.id === selectedResourceId, [itemInstance, selectedResourceId]);
  const resource = useMemo(() => resourceMap[itemInstance.id], [itemInstance.id, resourceMap]);
  const absolutePath = useMemo(() => getAbsoluteFilePath(resource.filePath, fileMap), [fileMap, resource.filePath]);
  const basename = useMemo(
    () => (osPlatform === 'win32' ? path.win32.basename(absolutePath) : path.basename(absolutePath)),
    [absolutePath, osPlatform]
  );
  const dirname = useMemo(
    () => (osPlatform === 'win32' ? path.win32.dirname(absolutePath) : path.dirname(absolutePath)),
    [absolutePath, osPlatform]
  );
  const platformFileManagerName = useMemo(() => (osPlatform === 'darwin' ? 'Finder' : 'Explorer'), [osPlatform]);

  const onClickShowFile = () => {
    if (!resource) {
      return;
    }

    dispatch(setLeftMenuSelection('file-explorer'));
    dispatch(setSelectingFile(true));
    dispatch(selectFile({filePath: resource.filePath}));
  };

  const menuItems = [
    {
      key: 'show_file',
      label: 'Go to file',
      disabled: isInPreviewMode,
      onClick: onClickShowFile,
    },
    {key: 'divider-1', type: 'divider'},

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
        navigator.clipboard.writeText(resource.filePath);
      },
    },
    {key: 'divider-2', type: 'divider'},
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
    {key: 'divider-4', type: 'divider'},
    {
      key: 'reveal_in_finder',
      label: `Reveal in ${platformFileManagerName}`,
      onClick: () => {
        showItemInFolder(absolutePath);
      },
    },
  ];

  return (
    <ContextMenu overlay={<Menu items={menuItems} />}>
      <StyledActionsMenuIconContainer isSelected={itemInstance.isSelected}>
        <Dots color={isResourceSelected ? Colors.blackPure : undefined} />
      </StyledActionsMenuIconContainer>
    </ContextMenu>
  );
};

export default KustomizationContextMenu;
