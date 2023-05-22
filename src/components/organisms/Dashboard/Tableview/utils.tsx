import {ExclamationCircleOutlined} from '@ant-design/icons';
import {setDashboardSelectedResourceId} from '@redux/dashboard';

import {setAlert} from '@redux/reducers/alert';
import {editorHasReloadedSelectedPath} from '@redux/reducers/main';
import {removeResources} from '@redux/thunks/removeResources';
import {AlertEnum} from '@shared/models/alert';
import {AppDispatch} from '@shared/models/appDispatch';
import {K8sResource} from '@shared/models/k8sResource';
import {Modal} from 'antd';

export const deleteResourceHandler = (dispatch: AppDispatch, resource?: K8sResource<'cluster'>) => {
  if (!resource) {
    return;
  }

  Modal.confirm({
    title: `This action will delete the resource from the Cluster.\n Are you sure you want to delete ${resource.name}?`,
    icon: <ExclamationCircleOutlined />,
    onOk() {
      return new Promise(resolve => {
        dispatch(removeResources([resource]));
        dispatch(editorHasReloadedSelectedPath(true));
        dispatch(setDashboardSelectedResourceId());
        dispatch(setAlert({title: 'Resource deleted from the cluster', message: '', type: AlertEnum.Success}));
        resolve({});
      });
    },
    onCancel() {},
  });
};
