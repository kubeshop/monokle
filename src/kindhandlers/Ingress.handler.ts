import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

const IngressHandler: ResourceKindHandler = {
  kind: 'Ingress',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.NETWORK, 'Ingresses'],
  clusterApiVersion: 'networking.k8s.io/v1',
  validationSchemaPrefix: 'io.k8s.api.networking.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
    const k8sNetworkingV1Api = kubeconfig.makeApiClient(k8s.NetworkingV1Api);
    return k8sNetworkingV1Api.readNamespacedIngress(resource.name, resource.namespace || 'default');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const k8sNetworkingV1Api = kubeconfig.makeApiClient(k8s.NetworkingV1Api);
    const response = namespace
      ? await k8sNetworkingV1Api.listNamespacedIngress(namespace as string)
      : await k8sNetworkingV1Api.listIngressForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
    const k8sNetworkingV1Api = kubeconfig.makeApiClient(k8s.NetworkingV1Api);
    await k8sNetworkingV1Api.deleteNamespacedIngress(resource.name, resource.namespace || 'default');
  },
  outgoingRefMappers: [
    {
      source: {
        pathParts: ['backend', 'service', 'name'],
      },
      target: {
        kind: 'Service',
      },
      type: 'name',
    },
  ],
  helpLink: 'https://kubernetes.io/docs/concepts/services-networking/ingress/',
};

export default IngressHandler;
