import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {ResourceKindHandler} from '@monokle-desktop/shared';
import {K8sResource} from '@monokle-desktop/shared';

const ResourceQuotaHandler: ResourceKindHandler = {
  kind: 'ResourceQuota',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.CONFIGURATION, 'Resource Quotas'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.core.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    return k8sCoreV1Api.readNamespacedResourceQuota(resource.name, resource.namespace || 'default', 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    const response = namespace
      ? await k8sCoreV1Api.listNamespacedResourceQuota(namespace)
      : await k8sCoreV1Api.listResourceQuotaForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    await k8sCoreV1Api.deleteNamespacedResourceQuota(resource.name, resource.namespace || 'default');
  },
  helpLink: 'https://kubernetes.io/docs/concepts/policy/resource-quotas/',
};

export default ResourceQuotaHandler;
