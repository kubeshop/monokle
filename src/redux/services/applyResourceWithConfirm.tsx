import {Modal} from 'antd';
import {ThunkDispatch} from 'redux-thunk';

import {KustomizeCommandType, isKustomizationResource} from '@redux/services/kustomize';
import {applyResource} from '@redux/thunks/applyResource';

import {FileMapType, ResourceMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';

import {ExclamationCircleOutlined} from '@ant-design/icons';

export function applyResourceWithConfirm(
  selectedResource: K8sResource,
  resourceMap: ResourceMapType,
  fileMap: FileMapType,
  dispatch: ThunkDispatch<any, any, any>,
  kubeconfig: string,
  options?: {
    isClusterPreview?: boolean;
    isInClusterDiff?: boolean;
    shouldPerformDiff?: boolean;
    kustomizeCommand?: KustomizeCommandType;
  }
) {
  const title = isKustomizationResource(selectedResource)
    ? `Deploy ${selectedResource.name} kustomization to your cluster?`
    : `Deploy ${selectedResource.name} to your cluster?`;

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    centered: true,
    onOk() {
      return new Promise(resolve => {
        applyResource(selectedResource.id, resourceMap, fileMap, dispatch, kubeconfig, options);
        resolve({});
      });
    },
    onCancel() {},
  });
}
