import React, {useCallback, useMemo} from 'react';

import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import path from 'path';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile} from '@redux/reducers/main';
import {setLeftMenuSelection} from '@redux/reducers/ui';
import {isInClusterModeSelector, isInPreviewModeSelectorNew, resourceMapSelector} from '@redux/selectors';
import {getAbsoluteFilePath} from '@redux/services/fileEntry';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {ContextMenu} from '@atoms';

import {useCreate, useDuplicate, useFilterByFileOrFolder, useProcessing, useRename} from '@hooks/fileTreeHooks';

import {deleteEntity, dispatchDeleteAlert} from '@utils/files';
import {isResourcePassingFilter} from '@utils/resources';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {K8sResource} from '@shared/models/k8sResource';
import {ItemCustomComponentProps} from '@shared/models/navigator';
import {LocalOrigin} from '@shared/models/origin';
import {showItemInFolder} from '@shared/utils/shell';

const KustomizationContextMenu: React.FC<ItemCustomComponentProps> = props => {
  const {itemInstance, children} = props;

  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const fileOrFolderContainedInFilter = useAppSelector(state => state.main.resourceFilter.fileOrFolderContainedIn);
  const filters = useAppSelector(state => state.main.resourceFilter);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const osPlatform = useAppSelector(state => state.config.osPlatform);
  const localResourceMap = useAppSelector(state => resourceMapSelector(state, 'local'));

  const areMenuItemsDisabled = useMemo(() => isInClusterMode || isInPreviewMode, [isInClusterMode, isInPreviewMode]);

  const {onCreateResource} = useCreate();
  const {onDuplicate} = useDuplicate();
  const {onFilterByFileOrFolder} = useFilterByFileOrFolder();
  const {onRename} = useRename();

  const resource = useMemo(
    () => localResourceMap[itemInstance.id] as K8sResource<LocalOrigin> | undefined,
    [itemInstance.id, localResourceMap]
  );
  const absolutePath = useMemo(
    () => (resource?.origin.filePath ? getAbsoluteFilePath(resource.origin.filePath, fileMap) : undefined),
    [fileMap, resource?.origin.filePath]
  );
  const basename = useMemo(() => {
    if (!absolutePath) {
      return undefined;
    }
    return osPlatform === 'win32' ? path.win32.basename(absolutePath) : path.basename(absolutePath);
  }, [absolutePath, osPlatform]);
  const dirname = useMemo(() => {
    if (!absolutePath) {
      return undefined;
    }
    return osPlatform === 'win32' ? path.win32.dirname(absolutePath) : path.dirname(absolutePath);
  }, [absolutePath, osPlatform]);
  const isRoot = useMemo(() => resource?.origin.filePath === ROOT_FILE_ENTRY, [resource?.origin.filePath]);
  const platformFileManagerName = useMemo(() => (osPlatform === 'darwin' ? 'Finder' : 'Explorer'), [osPlatform]);
  const target = useMemo(
    () => (isRoot ? ROOT_FILE_ENTRY : resource?.origin.filePath.replace(path.sep, '')),
    [isRoot, resource?.origin.filePath]
  );
  const isPassingFilter = useMemo(
    () => (resource ? isResourcePassingFilter(resource, filters) : false),
    [filters, resource]
  );

  const refreshFolder = useCallback(() => setRootFolder(fileMap[ROOT_FILE_ENTRY].filePath), [fileMap]);
  const {onExcludeFromProcessing} = useProcessing(refreshFolder);

  const onClickShowFile = () => {
    if (!resource) {
      return;
    }

    dispatch(setLeftMenuSelection('file-explorer'));
    dispatch(selectFile({filePath: resource.origin.filePath}));
  };

  const menuItems = [
    {
      key: 'show_file',
      label: 'Go to file',
      disabled: areMenuItemsDisabled,
      onClick: onClickShowFile,
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
        fileOrFolderContainedInFilter && resource?.origin.filePath === fileOrFolderContainedInFilter
          ? 'Remove from filter'
          : 'Filter on this file',
      disabled: true,
      onClick: () => {
        if (isRoot || (fileOrFolderContainedInFilter && resource?.origin.filePath === fileOrFolderContainedInFilter)) {
          onFilterByFileOrFolder(undefined);
        } else {
          onFilterByFileOrFolder(resource?.origin.filePath);
        }
      },
    },
    {
      key: 'add_to_files_exclude',
      label: 'Add to Files: Exclude',
      disabled: areMenuItemsDisabled,
      onClick: () => {
        if (!resource) {
          return;
        }
        onExcludeFromProcessing(resource.origin.filePath);
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
        if (!resource) {
          return;
        }
        navigator.clipboard.writeText(resource.origin.filePath);
      },
    },
    {key: 'divider-4', type: 'divider'},
    {
      key: 'duplicate_entity',
      label: 'Duplicate',
      disabled: areMenuItemsDisabled,
      onClick: () => {
        if (!absolutePath || !basename || !dirname) {
          return;
        }
        onDuplicate(absolutePath, basename, dirname);
      },
    },
    {
      key: 'rename_entity',
      label: 'Rename',
      disabled: areMenuItemsDisabled,
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
      disabled: areMenuItemsDisabled,
      onClick: () => {
        Modal.confirm({
          title: `Are you sure you want to delete "${basename}"?`,
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
  ];

  return (
    <ContextMenu disabled={!isPassingFilter} items={menuItems} triggerOnRightClick>
      {children}
    </ContextMenu>
  );
};

export default KustomizationContextMenu;
