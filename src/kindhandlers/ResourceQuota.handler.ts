import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const ResourceQuotaHandler: ResourceKindHandler = {
  kind: 'ResourceQuota',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.CONFIGURATION, 'Resource Quotas'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.core.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    k8sCoreV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    return k8sCoreV1Api.readNamespacedResourceQuota(resource.name, resource.namespace || 'default', 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    k8sCoreV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    const response = namespace
      ? await k8sCoreV1Api.listNamespacedResourceQuota(namespace)
      : await k8sCoreV1Api.listResourceQuotaForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    k8sCoreV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    await k8sCoreV1Api.deleteNamespacedResourceQuota(resource.name, resource.namespace || 'default');
  },
  helpLink: 'https://kubernetes.io/docs/concepts/policy/resource-quotas/',
};

export default ResourceQuotaHandler;
