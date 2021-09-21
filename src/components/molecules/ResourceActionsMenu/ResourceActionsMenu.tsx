import React from 'react';
import {Menu, Modal} from 'antd';
import {K8sResource} from '@models/k8sresource';
import {useAppDispatch} from '@redux/hooks';
import {removeResource} from '@redux/reducers/main';
import {AppDispatch} from '@redux/store';
import {ExclamationCircleOutlined} from '@ant-design/icons';
import {isFileResource, isUnsavedResource} from '@redux/services/resource';
import {openNewResourceWizard, openRenameResourceModal} from '@redux/reducers/ui';
import {getResourcesForPath} from '@redux/services/fileEntry';
import {PreviewType, ResourceMapType} from '@models/appstate';

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

const ResourceActionsMenu = (props: {
  resource: K8sResource;
  resourceMap: ResourceMapType;
  isInPreviewMode: boolean;
  previewType?: PreviewType;
}) => {
  const {resource, resourceMap, isInPreviewMode, previewType} = props;
  const dispatch = useAppDispatch();

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

  return (
    <Menu>
      <Menu.Item disabled={isInPreviewMode} onClick={onClickRename} key="rename">
        Rename
      </Menu.Item>
      <Menu.Item disabled={isInPreviewMode} onClick={onClickClone} key="clone">
        Clone
      </Menu.Item>
      <Menu.Item disabled={isInPreviewMode && previewType !== 'cluster'} onClick={onClickDelete} key="delete">
        Delete
      </Menu.Item>
    </Menu>
  );
};

export default ResourceActionsMenu;
