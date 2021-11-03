import {K8sResource} from '@models/k8sresource';
import {ResourceMapType, FileMapType} from '@models/appstate';
import {applyResource} from '@redux/thunks/applyResource';
import {ThunkDispatch} from 'redux-thunk';
import {Modal} from 'antd';
import {ExclamationCircleOutlined} from '@ant-design/icons';
import {isKustomizationResource, KustomizeCommandType} from '@redux/services/kustomize';

export function applyResourceWithConfirm(
  selectedResource: K8sResource,
  resourceMap: ResourceMapType,
  fileMap: FileMapType,
  dispatch: ThunkDispatch<any, any, any>,
  kubeconfig: string,
  options?: {
    isClusterPreview?: boolean;
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
    onOk() {
      return new Promise(resolve => {
        applyResource(selectedResource.id, resourceMap, fileMap, dispatch, kubeconfig, options);
        resolve({});
      });
    },
    onCancel() {},
  });
}
