import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';
import navSectionNames from '@constants/navSectionNames';
import {PodOutgoingRefMappers} from './common/outgoingRefMappers';

const DaemonSetHandler: ResourceKindHandler = {
  kind: 'DaemonSet',
  apiVersionMatcher: '**',
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.WORKLOADS, 'DaemonSets'],
  clusterApiVersion: 'apps/v1',
  validationSchemaPrefix: 'io.k8s.api.apps.v1',
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
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, name: string, namespace?: string) {
    const k8sAppV1Api = kubeconfig.makeApiClient(k8s.AppsV1Api);
    await k8sAppV1Api.deleteNamespacedDaemonSet(name, namespace || 'default');
  },
  outgoingRefMappers: [...PodOutgoingRefMappers],
};

export default DaemonSetHandler;
