import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';
import {PodOutgoingRefMappers} from './common/outgoingRefMappers';

const DaemonSetHandler: ResourceKindHandler = {
  kind: 'DaemonSet',
  apiVersionMatcher: '*',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string, namespace: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.AppsV1Api);
    return k8sCoreV1Api.readNamespacedDaemonSet(name, namespace, 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sAppV1Api = kubeconfig.makeApiClient(k8s.AppsV1Api);
    const response = await k8sAppV1Api.listDaemonSetForAllNamespaces();
    return response.body.items;
  },
  outgoingRefMappers: [...PodOutgoingRefMappers],
};

export default DaemonSetHandler;
