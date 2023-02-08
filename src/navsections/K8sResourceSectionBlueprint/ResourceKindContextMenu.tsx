import {useCallback, useMemo, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';
import {v4 as uuidv4} from 'uuid';

import {makeApplyKustomizationText, makeApplyResourceText} from '@constants/makeApplyText';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {editorHasReloadedSelectedPath} from '@redux/reducers/main';
import {addTerminal, setSelectedTerminal} from '@redux/reducers/terminal';
import {
  openNewResourceWizard,
  openRenameResourceModal,
  openSaveResourcesToFileFolderModal,
  setLeftBottomMenuSelection,
} from '@redux/reducers/ui';
import {
  currentConfigSelector,
  isInClusterModeSelector,
  isInPreviewModeSelectorNew,
  kubeConfigContextColorSelector,
} from '@redux/selectors';
import {knownResourceKindsSelector} from '@redux/selectors/resourceKindSelectors';
import {activeResourceMapSelector} from '@redux/selectors/resourceMapSelectors';
import {resourceSelector} from '@redux/selectors/resourceSelectors';
import {getLocalResourceMetasForPath} from '@redux/services/fileEntry';
import {isKustomizationResource} from '@redux/services/kustomize';
import {isResourceSelected} from '@redux/services/resource';
import {applyResource} from '@redux/thunks/applyResource';
import {removeResources} from '@redux/thunks/removeResources';

import {ModalConfirmWithNamespaceSelect} from '@molecules';

import {ContextMenu, Dots} from '@atoms';

import {useDiff, useInstallDeploy} from '@hooks/resourceHooks';

import {hotkeys} from '@shared/constants/hotkeys';
import {AppDispatch} from '@shared/models/appDispatch';
import {K8sResource, ResourceMap, isLocalResource} from '@shared/models/k8sResource';
import {ItemCustomComponentProps} from '@shared/models/navigator';
import {Colors} from '@shared/styles/colors';
import {defineHotkey} from '@shared/utils/hotkey';
import {kubeConfigContextSelector} from '@shared/utils/selectors';

const StyledActionsMenuIconContainer = styled.span<{isSelected: boolean}>`
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
`;

function deleteResourceWithConfirm(resource: K8sResource, resourceMap: ResourceMap, dispatch: AppDispatch) {
  let title = `Are you sure you want to delete ${resource.name}?`;

  if (isLocalResource(resource)) {
    const resourcesFromPath = getLocalResourceMetasForPath(
      resource.origin.filePath,
      resourceMap as ResourceMap<'local'>
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
        dispatch(editorHasReloadedSelectedPath(true));
        resolve({});
      });
    },
    onCancel() {},
  });
}

const ResourceKindContextMenu = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;

  const dispatch = useAppDispatch();
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const defaultShell = useAppSelector(state => state.terminal.settings.defaultShell);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);
  const osPlatform = useAppSelector(state => state.config.osPlatform);
  const projectConfig = useAppSelector(currentConfigSelector);
  const resource = useAppSelector(state =>
    resourceSelector(state, {id: itemInstance.id, storage: itemInstance.meta?.resourceStorage})
  );
  const resourceMap = useAppSelector(activeResourceMapSelector);
  const isThisResourceSelected = useAppSelector(state =>
    Boolean(resource && isResourceSelected(resource, state.main.selection))
  );

  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);

  const {diffSelectedResource, isDisabled: isDiffDisabled} = useDiff(resource);
  const {isDisabled: isDeployDisabled} = useInstallDeploy(resource);

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

  const confirmModalTitle = useMemo(() => {
    if (!resource) {
      return '';
    }

    return isKustomizationResource(resource)
      ? makeApplyKustomizationText(resource.name, kubeConfigContext, kubeConfigContextColor)
      : makeApplyResourceText(resource.name, kubeConfigContext, kubeConfigContextColor);
  }, [kubeConfigContext, kubeConfigContextColor, resource]);

  const onClickApplyResource = useCallback(
    (namespace?: {name: string; new: boolean}) => {
      if (!resource) {
        setIsApplyModalVisible(false);
        return;
      }
      applyResource(resource.id, resourceMap, fileMap, dispatch, projectConfig, kubeConfigContext, namespace, {
        isInClusterMode,
      });
      setIsApplyModalVisible(false);
    },
    [resource, isInClusterMode, resourceMap, fileMap, dispatch, projectConfig, kubeConfigContext]
  );

  useHotkeys(
    defineHotkey(hotkeys.DELETE_RESOURCE.key),
    () => {
      if (isThisResourceSelected && resource) {
        deleteResourceWithConfirm(resource, resourceMap, dispatch);
      }
    },
    [isThisResourceSelected]
  );

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
    deleteResourceWithConfirm(resource, resourceMap, dispatch);
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
    {key: 'deploy', label: 'Deploy', disabled: isDeployDisabled, onClick: () => setIsApplyModalVisible(true)},
    {
      key: 'diff',
      label: 'Diff',
      disabled: isDiffDisabled,
      onClick: diffSelectedResource,
    },
    {key: 'divider-1', type: 'divider'},
    ...(isInClusterMode && resource.kind === 'Pod'
      ? [
          {key: 'shell', label: 'Shell', onClick: onClickOpenShell},
          {key: 'divider-2', type: 'divider'},
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
          {key: 'divider-3', type: 'divider'},
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
    <>
      <ContextMenu items={menuItems}>
        <StyledActionsMenuIconContainer isSelected={itemInstance.isSelected}>
          <Dots color={isThisResourceSelected ? Colors.blackPure : undefined} />
        </StyledActionsMenuIconContainer>
      </ContextMenu>

      {isApplyModalVisible && (
        <ModalConfirmWithNamespaceSelect
          isVisible={isApplyModalVisible}
          resourceMetaList={resource ? [resource] : []}
          title={confirmModalTitle}
          onOk={selectedNamespace => onClickApplyResource(selectedNamespace)}
          onCancel={() => setIsApplyModalVisible(false)}
        />
      )}
    </>
  );
};

export default ResourceKindContextMenu;
