import {useMemo} from 'react';

import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {v4 as uuidv4} from 'uuid';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {addTerminal, setSelectedTerminal} from '@redux/reducers/terminal';
import {
  openNewResourceWizard,
  openRenameResourceModal,
  openSaveResourcesToFileFolderModal,
  setLeftBottomMenuSelection,
} from '@redux/reducers/ui';
import {isInClusterModeSelector, isInPreviewModeSelectorNew} from '@redux/selectors';
import {knownResourceKindsSelector} from '@redux/selectors/resourceKindSelectors';
import {activeResourceMetaMapSelector} from '@redux/selectors/resourceMapSelectors';
import {resourceSelector} from '@redux/selectors/resourceSelectors';
import {getLocalResourceMetasForPath} from '@redux/services/fileEntry';
import {removeResources} from '@redux/thunks/removeResources';

import {ContextMenu} from '@atoms';

import {AppDispatch} from '@shared/models/appDispatch';
import {K8sResource, ResourceMetaMap, isLocalResource} from '@shared/models/k8sResource';
import {ItemCustomComponentProps} from '@shared/models/navigator';

function deleteResourceWithConfirm(resource: K8sResource, resourceMap: ResourceMetaMap, dispatch: AppDispatch) {
  let title = `Are you sure you want to delete ${resource.name}?`;

  if (isLocalResource(resource)) {
    const resourcesFromPath = getLocalResourceMetasForPath(
      resource.origin.filePath,
      resourceMap as ResourceMetaMap<'local'>
    );
    if (resourcesFromPath.length === 1) {
      title = `This action will delete the ${resource.origin.filePath} file.\n${title}`;
    }
  } else if (resource.storage === 'cluster') {
    title = `This action will delete the resource from the Cluster.\n${title}`;
  }

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    onOk() {
      return new Promise(resolve => {
        dispatch(removeResources([resource]));
        resolve({});
      });
    },
    onCancel() {},
  });
}

const ResourceKindContextMenuWrapper = (props: ItemCustomComponentProps) => {
  const {itemInstance, children} = props;

  const dispatch = useAppDispatch();
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const defaultShell = useAppSelector(state => state.terminal.settings.defaultShell);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const osPlatform = useAppSelector(state => state.config.osPlatform);
  const resource = useAppSelector(state =>
    resourceSelector(state, {id: itemInstance.id, storage: itemInstance.meta?.resourceStorage})
  );

  const activeResourceMetaMap = useAppSelector(activeResourceMetaMapSelector);
  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);

  const shellCommand = useMemo(() => {
    if (!resource || resource.kind !== 'Pod') {
      return;
    }

    let terminalCommand = `${osPlatform !== 'win32' ? 'exec ' : ''}kubectl exec -i -t -n `;
    terminalCommand += `${resource.namespace || 'default'} ${resource.name}`;

    const container = resource.object.spec?.containers?.[0];

    if (container) {
      terminalCommand += ` -c ${container.name} -- sh -c "clear; (bash || ash || sh)"`;
    }

    return terminalCommand;
  }, [osPlatform, resource]);

  if (!resource) {
    return null;
  }

  const onClickRename = () => {
    dispatch(openRenameResourceModal(resource));
  };

  const onClickClone = () => {
    dispatch(
      openNewResourceWizard({
        defaultInput: {
          name: resource.name,
          kind: resource.kind,
          apiVersion: resource.apiVersion,
          namespace: resource.namespace,
          selectedResourceId: resource.id,
        },
      })
    );
  };

  const onClickDelete = () => {
    deleteResourceWithConfirm(resource, activeResourceMetaMap, dispatch);
  };

  const onClickSaveToFileFolder = () => {
    dispatch(openSaveResourcesToFileFolderModal([resource]));
  };

  const onClickOpenShell = () => {
    const newTerminalId = uuidv4();
    dispatch(setSelectedTerminal(newTerminalId));
    dispatch(
      addTerminal({
        id: newTerminalId,
        isRunning: false,
        defaultCommand: shellCommand,
        pod: resource,
        shell: defaultShell,
      })
    );

    if (!bottomSelection || bottomSelection !== 'terminal') {
      dispatch(setLeftBottomMenuSelection('terminal'));
    }
  };

  const menuItems = [
    ...(isInClusterMode && resource.kind === 'Pod'
      ? [
          {key: 'shell', label: 'Shell', onClick: onClickOpenShell},
          {key: 'divider-1', type: 'divider'},
        ]
      : []),
    ...(isInPreviewMode || resource.storage === 'transient'
      ? [
          {
            key: 'save_to_file_folder',
            label: 'Save to file/folder',
            disabled: isInPreviewMode,
            onClick: onClickSaveToFileFolder,
          },
          {key: 'divider', type: 'divider'},
        ]
      : []),
    {key: 'rename', label: 'Rename', onClick: onClickRename},
    ...(knownResourceKinds.includes(resource.kind)
      ? [
          {
            key: 'clone',
            label: 'Clone',
            disabled: isInPreviewMode,
            onClick: onClickClone,
          },
        ]
      : []),
    {key: 'delete', label: 'Delete', disabled: isInPreviewMode, onClick: onClickDelete},
  ];

  return (
    <ContextMenu items={menuItems} triggerOnRightClick>
      {children}
    </ContextMenu>
  );
};

export default ResourceKindContextMenuWrapper;
