import {useCallback, useMemo, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';
import {v4 as uuidv4} from 'uuid';

import {makeApplyKustomizationText, makeApplyResourceText} from '@constants/makeApplyText';

import {kubeConfigContextColorSelector, kubeConfigContextSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {editorHasReloadedSelectedPath} from '@redux/reducers/main';
import {addTerminal, setSelectedTerminal} from '@redux/reducers/terminal';
import {
  openNewResourceWizard,
  openRenameResourceModal,
  openSaveResourcesToFileFolderModal,
  setLeftBottomMenuSelection,
} from '@redux/reducers/ui';
import {knownResourceKindsSelector} from '@redux/selectors/resourceKindSelectors';
import {useActiveResourceMetaMapRef} from '@redux/selectors/resourceMapSelectors';
import {useResource} from '@redux/selectors/resourceSelectors';
import {getLocalResourceMetasForPath} from '@redux/services/fileEntry';
import {isKustomizationResource} from '@redux/services/kustomize';
import {isResourceSelected} from '@redux/services/resource';
import {applyResourceToCluster} from '@redux/thunks/applyResource';
import {removeResources} from '@redux/thunks/removeResources';

import {ModalConfirmWithNamespaceSelect} from '@molecules';

import {ContextMenu, Dots} from '@atoms';

import {useDiff, useInstallDeploy} from '@hooks/resourceHooks';

import {hotkeys} from '@shared/constants/hotkeys';
import {AppDispatch} from '@shared/models/appDispatch';
import {K8sResource, ResourceMeta, ResourceMetaMap, isLocalResource} from '@shared/models/k8sResource';
import {Colors} from '@shared/styles/colors';
import {defineHotkey} from '@shared/utils/hotkey';
import {isInClusterModeSelector, isInPreviewModeSelector} from '@shared/utils/selectors';

const StyledActionsMenuIconContainer = styled.span<{isSelected: boolean}>`
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
`;

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
        dispatch(editorHasReloadedSelectedPath(true));
        resolve({});
      });
    },
    onCancel() {},
  });
}

type Props = {
  resourceMeta: ResourceMeta;
  isSelected: boolean;
};

const ResourceKindContextMenu = (props: Props) => {
  const {resourceMeta, isSelected} = props;

  const dispatch = useAppDispatch();
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const defaultShell = useAppSelector(state => state.terminal.settings.defaultShell);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);
  const osPlatform = useAppSelector(state => state.config.osPlatform);
  const resourceMetaMapRef = useActiveResourceMetaMapRef();

  const resource = useResource(resourceMeta);
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

    let terminalCommand = 'kubectl exec -it -n ';
    terminalCommand += `${resource.namespace || 'default'} ${resource.name} `;

    const container = resource.object.spec?.containers?.[0];

    if (container) {
      terminalCommand += `-c ${container.name} `;
    }

    terminalCommand += `-- ${osPlatform === 'win32' ? '/bin/sh' : '/bin/bash'}`;

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
      dispatch(
        applyResourceToCluster({
          resourceIdentifier: resource,
          namespace,
          options: {
            isInClusterMode,
          },
        })
      );

      setIsApplyModalVisible(false);
    },
    [resource, isInClusterMode, dispatch]
  );

  useHotkeys(
    defineHotkey(hotkeys.DELETE_RESOURCE.key),
    () => {
      if (isThisResourceSelected && resource) {
        deleteResourceWithConfirm(resource, resourceMetaMapRef.current, dispatch);
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
    deleteResourceWithConfirm(resource, resourceMetaMapRef.current, dispatch);
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
        <StyledActionsMenuIconContainer isSelected={isSelected}>
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
