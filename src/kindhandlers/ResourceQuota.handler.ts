import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {clusterResourceWatcher} from '.';

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
  watcherReq: undefined,
  disconnectFromCluster() {
    try {
      ResourceQuotaHandler.watcherReq.abort();
      ResourceQuotaHandler.watcherReq = undefined;
    } catch (e: any) {
      ResourceQuotaHandler.watcherReq = undefined;
    }
  },
  async watchResources(...args) {
    const requestPath: string = args[2]?.namespace
      ? `/api/v1/namespaces/${args[2].namespace}/resourcequotas`
      : `/api/v1/resourcequotas`;
    clusterResourceWatcher(ResourceQuotaHandler, requestPath, args[0], args[1], args[2], args[3]);
    return ResourceQuotaHandler.listResourcesInCluster(args[1], args[2], args[3]);
  },
};

export default ResourceQuotaHandler;
