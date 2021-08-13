import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';
import {PodOutgoingRefMappers} from './common/outgoingRefMappers';

const ReplicaSetHandler: ResourceKindHandler = {
  kind: 'ReplicaSet',
  apiVersionMatcher: '*',
  clusterApiVersion: 'apps/v1',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string, namespace: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.AppsV1Api);
    return k8sCoreV1Api.readNamespacedReplicaSet(name, namespace, 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sAppV1Api = kubeconfig.makeApiClient(k8s.AppsV1Api);
    const response = await k8sAppV1Api.listReplicaSetForAllNamespaces();
    return response.body.items;
  },
  outgoingRefMappers: [...PodOutgoingRefMappers],
};

export default ReplicaSetHandler;
