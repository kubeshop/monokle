import {useMemo} from 'react';

import {Menu, Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {KUSTOMIZATION_KIND} from '@constants/constants';

import {ResourceMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {ItemCustomComponentProps} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {removeResource} from '@redux/reducers/main';
import {openNewResourceWizard, openRenameResourceModal, openSaveResourcesToFileFolderModal} from '@redux/reducers/ui';
import {isInPreviewModeSelector} from '@redux/selectors';
import {getResourcesForPath} from '@redux/services/fileEntry';
import {isFileResource, isUnsavedResource} from '@redux/services/resource';
import {AppDispatch} from '@redux/store';

import {Dots} from '@atoms';

import ContextMenu from '@components/molecules/ContextMenu';

import Colors from '@styles/Colors';

import {ResourceKindHandlers} from '@src/kindhandlers';

const ContextMenuDivider = styled.div`
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
`;

const StyledActionsMenuIconContainer = styled.span<{isSelected: boolean}>`
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
`;

function deleteResourceWithConfirm(resource: K8sResource, resourceMap: ResourceMapType, dispatch: AppDispatch) {
  let title = `Are you sure you want to delete ${resource.name}?`;

  if (isFileResource(resource)) {
    const resourcesFromPath = getResourcesForPath(resource.filePath, resourceMap);
    if (resourcesFromPath.length === 1) {
      title = `This action will delete the ${resource.filePath} file.\n${title}`;
    }
  } else if (!isUnsavedResource(resource)) {
    title = `This action will delete the resource from the Cluster.\n${title}`;
  }

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    onOk() {
      return new Promise(resolve => {
        dispatch(removeResource(resource.id));
        resolve({});
      });
    },
    onCancel() {},
  });
}

const KnownResourceKinds: string[] = [KUSTOMIZATION_KIND, ...ResourceKindHandlers.map(kindHandler => kindHandler.kind)];

const ResourceKindContextMenu = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;

  const dispatch = useAppDispatch();

  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const previewType = useAppSelector(state => state.main.previewType);
  const resource = useAppSelector(state => state.main.resourceMap[itemInstance.id]);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);

  const isResourceSelected = useMemo(() => {
    return itemInstance.id === selectedResourceId;
  }, [itemInstance, selectedResourceId]);

  if (!resource) {
    return null;
  }

  const onClickRename = () => {
    dispatch(openRenameResourceModal(resource.id));
  };

  const onClickClone = () => {
    dispatch(
      openNewResourceWizard({
        defaultInput: {
          name: resource.name,
          kind: resource.kind,
          apiVersion: resource.version,
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
    dispatch(openSaveResourcesToFileFolderModal([itemInstance.id]));
  };

  const menu = (
    <Menu>
      {isInPreviewMode && (
        <>
          <Menu.Item onClick={onClickSaveToFileFolder} key="save_to_file_folder">
            Save to file/folder
          </Menu.Item>
          <ContextMenuDivider />
        </>
      )}

      <Menu.Item disabled={isInPreviewMode} onClick={onClickRename} key="rename">
        Rename
      </Menu.Item>

      {KnownResourceKinds.includes(resource.kind) && (
        <Menu.Item disabled={isInPreviewMode} onClick={onClickClone} key="clone">
          Clone
        </Menu.Item>
      )}

      <Menu.Item disabled={isInPreviewMode && previewType !== 'cluster'} onClick={onClickDelete} key="delete">
        Delete
      </Menu.Item>
    </Menu>
  );

  return (
    <ContextMenu overlay={menu}>
      <StyledActionsMenuIconContainer isSelected={itemInstance.isSelected}>
        <Dots color={isResourceSelected ? Colors.blackPure : undefined} />
      </StyledActionsMenuIconContainer>
    </ContextMenu>
  );
};

export default ResourceKindContextMenu;
