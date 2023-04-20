import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const NetworkPolicyHandler: ResourceKindHandler = {
  kind: 'NetworkPolicy',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.NETWORK, 'NetworkPolicies'],
  clusterApiVersion: 'networking.k8s.io/v1',
  validationSchemaPrefix: 'io.k8s.api.networking.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta): Promise<any> {
    const k8sNetworkingV1Api = kubeconfig.makeApiClient(k8s.NetworkingV1Api);
    k8sNetworkingV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    return k8sNetworkingV1Api.readNamespacedNetworkPolicy(resource.name, resource.namespace || 'default');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const k8sNetworkingV1Api = kubeconfig.makeApiClient(k8s.NetworkingV1Api);
    k8sNetworkingV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    const response = namespace
      ? await k8sNetworkingV1Api.listNamespacedNetworkPolicy(namespace)
      : await k8sNetworkingV1Api.listNetworkPolicyForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta) {
    const k8sNetworkingV1Api = kubeconfig.makeApiClient(k8s.NetworkingV1Api);
    k8sNetworkingV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    await k8sNetworkingV1Api.deleteNamespacedNetworkPolicy(resource.name, resource.namespace || 'default');
  },
  helpLink: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/',
};

export default NetworkPolicyHandler;
