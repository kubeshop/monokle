import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';
import {NAV_K8S_RESOURCES, SECTION_NETWORK} from '@constants/navigator';

const IngressHandler: ResourceKindHandler = {
  kind: 'Ingress',
  apiVersionMatcher: '*',
  navigatorPath: [NAV_K8S_RESOURCES, SECTION_NETWORK, 'Ingresses'],
  clusterApiVersion: 'networking.k8s.io/v1',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string, namespace: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.NetworkingV1Api);
    return k8sCoreV1Api.readNamespacedIngress(name, namespace);
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sNetworkingV1Api = kubeconfig.makeApiClient(k8s.NetworkingV1Api);
    const response = await k8sNetworkingV1Api.listIngressForAllNamespaces();
    return response.body.items;
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
};

export default IngressHandler;
