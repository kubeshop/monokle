import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {clusterResourceWatcher} from '.';

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
      ? await k8sNetworkingV1Api.listNamespacedIngress(namespace)
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
  watcherReq: undefined,
  disconnectFromCluster() {
    try {
      IngressHandler.watcherReq.abort();
      IngressHandler.watcherReq = undefined;
    } catch (e: any) {
      IngressHandler.watcherReq = undefined;
    }
  },
  async watchResources(...args) {
    const requestPath: string = args[2]?.namespace
      ? `/apis/networking.k8s.io/v1/namespaces/${args[2].namespace}/ingresses`
      : `/apis/networking.k8s.io/v1/ingresses`;
    clusterResourceWatcher(IngressHandler, requestPath, args[0], args[1], args[2], args[3]);
    return IngressHandler.listResourcesInCluster(args[1], args[2], args[3]);
  },
};

export default IngressHandler;
