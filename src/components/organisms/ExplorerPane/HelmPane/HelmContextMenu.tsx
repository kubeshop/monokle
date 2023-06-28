import {useMemo} from 'react';

import {Modal, Tooltip} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import path from 'path';
import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile} from '@redux/reducers/main';
import {setExplorerSelectedSection, setLeftMenuSelection} from '@redux/reducers/ui';
import {runHelmCommand} from '@redux/thunks/runHelmCommand';

import {ContextMenu, Dots} from '@atoms';

import {useDuplicate, useRename} from '@hooks/fileTreeHooks';

import {deleteFileEntry, dispatchDeleteAlert} from '@utils/files';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {HelmValuesFile} from '@shared/models/helm';
import {Colors} from '@shared/styles/colors';
import {isInClusterModeSelector, isInPreviewModeSelector} from '@shared/utils/selectors';
import {showItemInFolder} from '@shared/utils/shell';

type IProps = {
  id: string;
  isSelected: boolean;
};

// TODO: temporary solution for renaming value file
const DEFAULT_HELM_VALUE: HelmValuesFile = {
  filePath: '',
  id: '',
  name: '',
  helmChartId: '',
  values: [],
};

const HelmContextMenu: React.FC<IProps> = props => {
  const {id, isSelected} = props;

  const dispatch = useAppDispatch();

  const fileOrFolderContainedInFilter = useAppSelector(state => state.main.resourceFilter.fileOrFolderContainedIn);
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const helmTemplatesMap = useAppSelector(state => state.main.helmTemplatesMap);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const osPlatform = useAppSelector(state => state.config.osPlatform);
  const rootFolderPath = useAppSelector(state => state.main.fileMap[ROOT_FILE_ENTRY].filePath);

  const {onDuplicate} = useDuplicate();
  const {onRename} = useRename();

  const helmItem = useMemo(
    () => helmValuesMap[id] || helmChartMap[id] || helmTemplatesMap[id] || DEFAULT_HELM_VALUE,
    [helmChartMap, helmTemplatesMap, helmValuesMap, id]
  );

  const fileEntry = useAppSelector(state => state.main.fileMap[helmItem.filePath]);

  const absolutePath = useMemo(() => path.join(rootFolderPath, helmItem.filePath), [rootFolderPath, helmItem]);
  const basename = useMemo(
    () => (osPlatform === 'win32' ? path.win32.basename(absolutePath) : path.basename(absolutePath)),
    [absolutePath, osPlatform]
  );
  const dirname = useMemo(
    () => (osPlatform === 'win32' ? path.win32.dirname(absolutePath) : path.dirname(absolutePath)),
    [absolutePath, osPlatform]
  );
  const platformFileManagerName = useMemo(() => (osPlatform === 'darwin' ? 'Finder' : 'Explorer'), [osPlatform]);

  const menuItems = useMemo(
    () => [
      helmChartMap[id] && {
        key: 'update_dependencies',
        label: <Tooltip title="Run 'helm dependency update' on this Helm Chart">Update Dependencies</Tooltip>,
        disabled: isInPreviewMode || isInClusterMode,
        onClick: (): void => {
          dispatch(runHelmCommand({chart: id, command: ['dependency', 'update']}));
        },
      },
      helmChartMap[id] && {key: 'divider-1', type: 'divider'},
      {
        key: 'show_file',
        label: 'Go to file',
        disabled: isInPreviewMode || isInClusterMode,
        onClick: () => {
          if (!helmItem) {
            return;
          }

          dispatch(setLeftMenuSelection('explorer'));
          dispatch(setExplorerSelectedSection('files'));
          dispatch(selectFile({filePath: helmItem.filePath}));
        },
      },
      {key: 'divider-2', type: 'divider'},
      {
        key: 'create_resource',
        label: 'Add Resource',
        disabled: true,
        onClick: () => {},
      },
      {key: 'divider-3', type: 'divider'},
      {
        key: 'filter_on_this_file',
        label:
          fileOrFolderContainedInFilter && helmItem.filePath === fileOrFolderContainedInFilter
            ? 'Remove from filter'
            : 'Filter on this file',
        disabled: true,
        onClick: () => {},
      },
      {
        key: 'add_to_files_exclude',
        label: 'Add to Files: Exclude',
        disabled: true,
        onClick: () => {},
      },
      {key: 'divider-4', type: 'divider'},
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
          navigator.clipboard.writeText(helmItem.filePath);
        },
      },
      {key: 'divider-5', type: 'divider'},
      {
        key: 'duplicate_entity',
        label: 'Duplicate',
        disabled: isInPreviewMode || isInClusterMode,
        onClick: () => {
          onDuplicate(absolutePath, basename, dirname);
        },
      },
      {
        key: 'rename_entity',
        label: 'Rename',
        disabled: isInPreviewMode || isInClusterMode,
        onClick: () => {
          onRename(absolutePath);
        },
      },
      {
        key: 'delete_entity',
        label: 'Delete',
        disabled: isInPreviewMode || isInClusterMode,
        onClick: () => {
          Modal.confirm({
            title: `Are you sure you want to delete "${basename}"?`,
            icon: <ExclamationCircleOutlined />,
            onOk() {
              deleteFileEntry(fileEntry).then(result => dispatchDeleteAlert(dispatch, result));
            },
          });
        },
      },
      {key: 'divider-6', type: 'divider'},
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
      helmItem,
      helmChartMap,
      isInPreviewMode,
      isInClusterMode,
      onDuplicate,
      onRename,
      platformFileManagerName,
      fileEntry,
      id,
    ]
  );

  return (
    <ContextMenu items={menuItems}>
      <ActionsMenuIconContainer isSelected={isSelected}>
        <Dots color={isSelected ? Colors.blackPure : undefined} />
      </ActionsMenuIconContainer>
    </ContextMenu>
  );
};

export default HelmContextMenu;

// Styled Components

const ActionsMenuIconContainer = styled.span<{isSelected: boolean}>`
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
`;
