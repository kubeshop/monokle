import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {ResourceKindHandler} from '@models/resourcekindhandler';

const IngressHandler: ResourceKindHandler = {
  kind: 'Ingress',
  apiVersionMatcher: '**',
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.NETWORK, 'Ingresses'],
  clusterApiVersion: 'networking.k8s.io/v1',
  validationSchemaPrefix: 'io.k8s.api.networking.v1',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string, namespace: string): Promise<any> {
    const k8sNetworkingV1Api = kubeconfig.makeApiClient(k8s.NetworkingV1Api);
    return k8sNetworkingV1Api.readNamespacedIngress(name, namespace);
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sNetworkingV1Api = kubeconfig.makeApiClient(k8s.NetworkingV1Api);
    const response = await k8sNetworkingV1Api.listIngressForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, name: string, namespace?: string) {
    const k8sNetworkingV1Api = kubeconfig.makeApiClient(k8s.NetworkingV1Api);
    await k8sNetworkingV1Api.deleteNamespacedIngress(name, namespace || 'default');
  },
  outgoingRefMappers: [
    {
      source: {
        pathParts: ['backend', 'service', 'name'],
      },
      target: {
        kind: 'Service',
        pathParts: ['metadata', 'name'],
      },
    },
  ],
  helpLink: 'https://kubernetes.io/docs/concepts/services-networking/ingress/',
};

export default IngressHandler;
