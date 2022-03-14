import {useMemo} from 'react';

import {Menu, Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {AppDispatch} from '@models/appdispatch';
import {ResourceMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {ItemCustomComponentProps} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {removeResource} from '@redux/reducers/main';
import {openNewResourceWizard, openRenameResourceModal, openSaveResourcesToFileFolderModal} from '@redux/reducers/ui';
import {isInPreviewModeSelector, knownResourceKindsSelector} from '@redux/selectors';
import {getResourcesForPath} from '@redux/services/fileEntry';
import {isFileResource, isUnsavedResource} from '@redux/services/resource';

import ContextMenu from '@components/molecules/ContextMenu';

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

const ResourceKindContextMenuWrapper = (props: ItemCustomComponentProps) => {
  const {itemInstance, children} = props;

  const dispatch = useAppDispatch();

  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const previewType = useAppSelector(state => state.main.previewType);
  const resource = useAppSelector(state => state.main.resourceMap[itemInstance.id]);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);

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
      {(isInPreviewMode || isUnsavedResource(resource)) && (
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

      {knownResourceKinds.includes(resource.kind) && (
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
    <ContextMenu overlay={menu} triggerOnRightClick>
      {children}
    </ContextMenu>
  );
};

export default ResourceKindContextMenuWrapper;
