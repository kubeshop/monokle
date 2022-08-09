import * as k8s from '@kubernetes/client-node';

import log from 'loglevel';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {
  implicitNamespaceMatcher,
  optionalExplicitNamespaceMatcher,
  targetKindMatcher,
} from '@src/kindhandlers/common/customMatchers';

import {clusterResourceWatcher} from '.';

const EndpointSliceHandler: ResourceKindHandler = {
  kind: 'EndpointSlice',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.NETWORK, 'EndpointSlice'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.discovery.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
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
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
    const discoveryV1Api = kubeconfig.makeApiClient(k8s.DiscoveryV1Api);
    await discoveryV1Api.deleteNamespacedEndpointSlice(resource.name, resource.namespace || 'default');
  },
  outgoingRefMappers: [
    {
      source: {
        pathParts: ['metadata', 'labels', 'kubernetes.io/service-name'],
        siblingMatchers: {
          namespace: implicitNamespaceMatcher,
        },
      },
      target: {
        kind: 'Service',
      },
      type: 'name',
    },
    {
      source: {
        pathParts: ['targetRef', 'name'],
        siblingMatchers: {
          namespace: optionalExplicitNamespaceMatcher,
          kind: targetKindMatcher,
        },
      },
      target: {
        kind: '$.*',
      },
      type: 'name',
    },
  ],
  helpLink: 'https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#endpointslice-v1-discovery-k8s-io',
  watcherReq: undefined,
  disconnectFromCluster() {
    try {
      EndpointSliceHandler.watcherReq.abort();
      EndpointSliceHandler.watcherReq = undefined;
    } catch (e: any) {
      EndpointSliceHandler.watcherReq = undefined;
      log.log(e.message);
    }
  },
  async watchResources(...args) {
    const requestPath: string = args[2]?.namespace
      ? `/apis/discovery.k8s.io/v1/namespaces/${args[2].namespace}/endpointslices`
      : `/apis/discovery.k8s.io/v1/endpointslices`;
    clusterResourceWatcher(EndpointSliceHandler, requestPath, args[0], args[1], args[2], args[3]);
    return EndpointSliceHandler.listResourcesInCluster(args[1], args[2], args[3]);
  },
};

export default EndpointSliceHandler;
