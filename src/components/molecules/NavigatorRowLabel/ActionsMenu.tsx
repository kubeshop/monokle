import React from 'react';
import {Menu, Modal} from 'antd';
import {K8sResource} from '@models/k8sresource';
import {useAppDispatch} from '@redux/hooks';
import {removeResource} from '@redux/reducers/main';
import {AppDispatch} from '@redux/store';
import {ExclamationCircleOutlined} from '@ant-design/icons';
import {isFileResource} from '@redux/services/resource';
import {openNewResourceWizard} from '@redux/reducers/ui';

function deleteResourceWithConfirm(resource: K8sResource, dispatch: AppDispatch) {
  let title = `Are you sure you want to delete ${resource.name}?`;

  if (isFileResource(resource)) {
    if (!resource.range) {
      title = `This action will delete the ${resource.filePath} file.\n${title}`;
    }
  } else {
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
const ActionsMenu = (props: {resource: K8sResource}) => {
  const {resource} = props;
  const dispatch = useAppDispatch();

  const cloneResource = () => {
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

  const deleteResource = () => {
    deleteResourceWithConfirm(resource, dispatch);
  };

  return (
    <Menu>
      <Menu.Item onClick={cloneResource} key="clone">
        Clone
      </Menu.Item>
      <Menu.Item onClick={deleteResource} key="delete">
        Delete
      </Menu.Item>
    </Menu>
  );
};

export default ActionsMenu;
