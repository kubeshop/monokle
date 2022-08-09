import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {optionalExplicitNamespaceMatcher, targetKindMatcher} from '@src/kindhandlers/common/customMatchers';

import {clusterResourceWatcher} from '.';

const EndpointsHandler: ResourceKindHandler = {
  kind: 'Endpoints',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.NETWORK, 'Endpoints'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.core.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    return k8sCoreV1Api.readNamespacedEndpoints(resource.name, resource.namespace || 'default', 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    const response = namespace
      ? await k8sCoreV1Api.listNamespacedEndpoints(namespace)
      : await k8sCoreV1Api.listEndpointsForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    await k8sCoreV1Api.deleteNamespacedEndpoints(resource.name, resource.namespace || 'default');
  },
  outgoingRefMappers: [
    {
      source: {
        pathParts: ['metadata', 'name'],
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
  helpLink: 'https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#endpoints-v1-core',
  watcherReq: undefined,
  disconnectFromCluster() {
    try {
      EndpointsHandler.watcherReq.abort();
      EndpointsHandler.watcherReq = undefined;
    } catch (e: any) {
      EndpointsHandler.watcherReq = undefined;
    }
  },
  async watchResources(...args) {
    const requestPath: string = args[2]?.namespace
      ? `/api/v1/namespaces/${args[2].namespace}/endpoints`
      : `/api/v1/endpoints`;
    clusterResourceWatcher(EndpointsHandler, requestPath, args[0], args[1], args[2], args[3]);
    return EndpointsHandler.listResourcesInCluster(args[1], args[2], args[3]);
  },
};

export default EndpointsHandler;
