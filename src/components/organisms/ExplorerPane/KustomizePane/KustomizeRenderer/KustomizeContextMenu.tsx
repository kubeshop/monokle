import {useCallback, useMemo, useRef} from 'react';

import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {basename, dirname} from 'path';
import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile} from '@redux/reducers/main';
import {setExplorerSelectedSection, setLeftMenuSelection} from '@redux/reducers/ui';
import {useResource} from '@redux/selectors/resourceSelectors';
import {getAbsoluteFilePath} from '@redux/services/fileEntry';
import {isResourceSelected} from '@redux/services/resource';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {ContextMenu, Dots} from '@atoms';

import {useDuplicate, useProcessing, useRename} from '@hooks/fileTreeHooks';

import {deleteFileEntry, dispatchDeleteAlert} from '@utils/files';
import {useRefSelector} from '@utils/hooks';
import {isResourcePassingFilter} from '@utils/resources';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {Colors} from '@shared/styles/colors';
import {isInPreviewModeSelector} from '@shared/utils/selectors';
import {showItemInFolder} from '@shared/utils/shell';

type IProps = {
  id: string;
  isSelected: boolean;
};

const KustomizeContextMenu: React.FC<IProps> = props => {
  const {id, isSelected} = props;

  const dispatch = useAppDispatch();
  const fileMapRef = useRefSelector(state => state.main.fileMap);

  const resource = useResource({id, storage: 'local'});
  const resourceRef = useRef(resource);
  resourceRef.current = resource;

  const fileEntry = useAppSelector(state =>
    resource?.origin.filePath ? state.main.fileMap[resource.origin.filePath] : undefined
  );
  const fileOrFolderContainedInFilter = useAppSelector(state => state.main.resourceFilter.fileOrFolderContainedIn);
  const filters = useAppSelector(state => state.main.resourceFilter);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isKustomizationSelected = useAppSelector(state =>
    resource ? isResourceSelected(resource, state.main.selection) : false
  );
  const osPlatform = useAppSelector(state => state.config.osPlatform);

  const {onDuplicate} = useDuplicate();

  const {onRename} = useRename();

  const absolutePath = useMemo(
    () => (resource?.origin.filePath ? getAbsoluteFilePath(resource?.origin.filePath, fileMapRef.current) : undefined),
    [resource?.origin.filePath, fileMapRef]
  );

  const platformFileManagerName = useMemo(() => (osPlatform === 'darwin' ? 'Finder' : 'Explorer'), [osPlatform]);
  const isPassingFilter = useMemo(
    () => (resource ? isResourcePassingFilter(resource, filters) : false),
    [filters, resource]
  );

  const refreshFolder = useCallback(
    () => dispatch(setRootFolder({rootFolder: fileMapRef.current[ROOT_FILE_ENTRY].filePath, isReload: true})),
    [dispatch, fileMapRef]
  );
  const {onExcludeFromProcessing} = useProcessing(refreshFolder);

  const onClickShowFile = useCallback(() => {
    if (!resourceRef.current) {
      return;
    }

    dispatch(setLeftMenuSelection('explorer'));
    dispatch(setExplorerSelectedSection('files'));
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
        onClick: () => {},
      },
      {key: 'divider-2', type: 'divider'},
      {
        key: 'filter_on_this_file',
        label:
          fileOrFolderContainedInFilter && resourceRef.current?.origin.filePath === fileOrFolderContainedInFilter
            ? 'Remove from filter'
            : 'Filter on this file',
        disabled: true,
        onClick: () => {},
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
          onDuplicate(absolutePath, basename(absolutePath), dirname(absolutePath));
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
          onRename(absolutePath);
        },
      },
      {
        key: 'delete_entity',
        label: 'Delete',
        disabled: isInPreviewMode,
        onClick: () => {
          Modal.confirm({
            title: `Are you sure you want to delete "${fileEntry ? fileEntry.name : undefined}"?`,
            icon: <ExclamationCircleOutlined />,
            onOk() {
              if (!fileEntry) {
                return;
              }
              deleteFileEntry(fileEntry).then(result => dispatchDeleteAlert(dispatch, result));
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
      fileEntry,
      isInPreviewMode,
      absolutePath,
      fileOrFolderContainedInFilter,
      platformFileManagerName,
      resourceRef,
      dispatch,
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
      <ActionsMenuIconContainer isSelected={isSelected}>
        <Dots color={isKustomizationSelected ? Colors.blackPure : undefined} />
      </ActionsMenuIconContainer>
    </ContextMenu>
  );
};

export default KustomizeContextMenu;

// Styled Components

const ActionsMenuIconContainer = styled.span<{isSelected: boolean}>`
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
`;
