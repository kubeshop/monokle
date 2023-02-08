import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const EndpointSliceHandler: ResourceKindHandler = {
  kind: 'EndpointSlice',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.NETWORK, 'EndpointSlice'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.discovery.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta): Promise<any> {
    const discoveryV1Api = kubeconfig.makeApiClient(k8s.DiscoveryV1Api);
    return discoveryV1Api.readNamespacedEndpointSlice(resource.name, resource.namespace || 'default', 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const discoveryV1Api = kubeconfig.makeApiClient(k8s.DiscoveryV1Api);
    const response = namespace
      ? await discoveryV1Api.listNamespacedEndpointSlice(namespace)
      : await discoveryV1Api.listEndpointSliceForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta) {
    const discoveryV1Api = kubeconfig.makeApiClient(k8s.DiscoveryV1Api);
    await discoveryV1Api.deleteNamespacedEndpointSlice(resource.name, resource.namespace || 'default');
  },
  helpLink: 'https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#endpointslice-v1-discovery-k8s-io',
};

export default EndpointSliceHandler;
