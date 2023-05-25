import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {setDashboardSelectedResourceId} from '@redux/dashboard';
import {setAlert} from '@redux/reducers/alert';
import {editorHasReloadedSelectedPath} from '@redux/reducers/main';
import {removeResources} from '@redux/thunks/removeResources';

import {AlertEnum} from '@shared/models/alert';
import {AppDispatch} from '@shared/models/appDispatch';
import {K8sResource} from '@shared/models/k8sResource';
import {trackEvent} from '@shared/utils/telemetry';
import restartDeployment from '@redux/services/restartDeployment';
import {connectCluster} from '@redux/cluster/thunks/connect';

export const deleteResourceHandler = (dispatch: AppDispatch, resource?: K8sResource<'cluster'>) => {
  if (!resource) {
    return;
  }

  Modal.confirm({
    title: `This action will delete the resource from the Cluster.\n Are you sure you want to delete ${resource.name}?`,
    icon: <ExclamationCircleOutlined />,
    onOk() {
      return new Promise(resolve => {
        trackEvent('cluster/actions/delete', {kind: resource.kind});
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

export const restartResourceHandler = (
  dispatch: AppDispatch,
  currentContext: string,
  kubeConfigPath: string | undefined,
  resource?: K8sResource<'cluster'>
) => {
  Modal.confirm({
    title: 'Do you want to restart the deployment?',
    icon: <ExclamationCircleOutlined />,
    onOk() {
      if (!resource?.name || !resource?.namespace) return;

      trackEvent('cluster/actions/restart');
      restartDeployment({currentContext, kubeConfigPath, name: resource.name, namespace: resource.namespace});
      // TODO: we should have a way of updating a single resource instead of restarting the whole cluster
      dispatch(connectCluster({context: currentContext, namespace: resource.namespace, reload: true}));
    },
    onCancel() {},
  });
};
