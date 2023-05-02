import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const IngressHandler: ResourceKindHandler = {
  kind: 'Ingress',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.NETWORK, 'Ingresses'],
  clusterApiVersion: 'networking.k8s.io/v1',
  validationSchemaPrefix: 'io.k8s.api.networking.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta): Promise<any> {
    const k8sNetworkingV1Api = kubeconfig.makeApiClient(k8s.NetworkingV1Api);
    k8sNetworkingV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    return k8sNetworkingV1Api.readNamespacedIngress(resource.name, resource.namespace || 'default');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const k8sNetworkingV1Api = kubeconfig.makeApiClient(k8s.NetworkingV1Api);
    k8sNetworkingV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    const response = namespace
      ? await k8sNetworkingV1Api.listNamespacedIngress(namespace)
      : await k8sNetworkingV1Api.listIngressForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta) {
    const k8sNetworkingV1Api = kubeconfig.makeApiClient(k8s.NetworkingV1Api);
    k8sNetworkingV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    await k8sNetworkingV1Api.deleteNamespacedIngress(resource.name, resource.namespace || 'default');
  },
  helpLink: 'https://kubernetes.io/docs/concepts/services-networking/ingress/',
};

export default IngressHandler;
