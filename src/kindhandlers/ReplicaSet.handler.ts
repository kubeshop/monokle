import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';
import navSectionNames from '@constants/navSectionNames';
import {PodOutgoingRefMappers} from './common/outgoingRefMappers';

const ReplicaSetHandler: ResourceKindHandler = {
  kind: 'ReplicaSet',
  apiVersionMatcher: '**',
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.WORKLOADS, 'ReplicaSets'],
  clusterApiVersion: 'apps/v1',
  validationSchemaPrefix: 'io.k8s.api.apps.v1',
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
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, name: string, namespace?: string) {
    const k8sAppV1Api = kubeconfig.makeApiClient(k8s.AppsV1Api);
    await k8sAppV1Api.deleteNamespacedReplicaSet(name, namespace || 'default');
  },
  outgoingRefMappers: [...PodOutgoingRefMappers],
};

export default ReplicaSetHandler;
