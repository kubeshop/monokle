import React from 'react';
import {Menu} from 'antd';
import {K8sResource} from '@models/k8sresource';
import {useAppDispatch} from '@redux/hooks';
import {removeResource} from '@redux/reducers/main';

const ActionsMenu = (props: {resource: K8sResource}) => {
  const {resource} = props;
  const dispatch = useAppDispatch();

  const deleteResource = () => {
    dispatch(removeResource(resource.id));
  };

  return (
    <Menu>
      <Menu.Item onClick={deleteResource} key="delete">
        Delete
      </Menu.Item>
    </Menu>
  );
};

export default ActionsMenu;
