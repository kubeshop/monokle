import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const PodHandler: ResourceKindHandler = {
  kind: 'Pod',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.WORKLOADS, 'Pods'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.core.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    k8sCoreV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    return k8sCoreV1Api.readNamespacedPod(resource.name, resource.namespace || 'default', 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    k8sCoreV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    const response = namespace
      ? await k8sCoreV1Api.listNamespacedPod(namespace)
      : await k8sCoreV1Api.listPodForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    k8sCoreV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    await k8sCoreV1Api.deleteNamespacedPod(resource.name, resource.namespace || 'default');
  },
  helpLink: 'https://kubernetes.io/docs/concepts/workloads/pods/',
};

export default PodHandler;
