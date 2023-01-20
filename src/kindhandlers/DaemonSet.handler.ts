import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const DaemonSetHandler: ResourceKindHandler = {
  kind: 'DaemonSet',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.WORKLOADS, 'DaemonSets'],
  clusterApiVersion: 'apps/v1',
  validationSchemaPrefix: 'io.k8s.api.apps.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta): Promise<any> {
    const k8sAppV1Api = kubeconfig.makeApiClient(k8s.AppsV1Api);
    return k8sAppV1Api.readNamespacedDaemonSet(resource.name, resource.namespace || 'default', 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const k8sAppV1Api = kubeconfig.makeApiClient(k8s.AppsV1Api);
    const response = namespace
      ? await k8sAppV1Api.listNamespacedDaemonSet(namespace)
      : await k8sAppV1Api.listDaemonSetForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta) {
    const k8sAppV1Api = kubeconfig.makeApiClient(k8s.AppsV1Api);
    await k8sAppV1Api.deleteNamespacedDaemonSet(resource.name, resource.namespace || 'default');
  },
  helpLink: 'https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/',
};

export default DaemonSetHandler;
