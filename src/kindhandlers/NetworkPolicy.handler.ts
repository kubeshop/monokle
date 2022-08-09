import * as k8s from '@kubernetes/client-node';

import log from 'loglevel';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {createPodSelectorOutgoingRefMappers} from '@src/kindhandlers/common/outgoingRefMappers';

import {clusterResourceWatcher} from '.';

const NetworkPolicyHandler: ResourceKindHandler = {
  kind: 'NetworkPolicy',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.NETWORK, 'NetworkPolicies'],
  clusterApiVersion: 'networking.k8s.io/v1',
  validationSchemaPrefix: 'io.k8s.api.networking.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
    const k8sNetworkingV1Api = kubeconfig.makeApiClient(k8s.NetworkingV1Api);
    return k8sNetworkingV1Api.readNamespacedNetworkPolicy(resource.name, resource.namespace || 'default');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const k8sNetworkingV1Api = kubeconfig.makeApiClient(k8s.NetworkingV1Api);
    const response = namespace
      ? await k8sNetworkingV1Api.listNamespacedNetworkPolicy(namespace)
      : await k8sNetworkingV1Api.listNetworkPolicyForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
    const k8sNetworkingV1Api = kubeconfig.makeApiClient(k8s.NetworkingV1Api);
    await k8sNetworkingV1Api.deleteNamespacedNetworkPolicy(resource.name, resource.namespace || 'default');
  },
  helpLink: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/',
  outgoingRefMappers: createPodSelectorOutgoingRefMappers(['podSelector', 'matchLabels']),
  watcherReq: undefined,
  disconnectFromCluster() {
    try {
      NetworkPolicyHandler.watcherReq.abort();
      NetworkPolicyHandler.watcherReq = undefined;
    } catch (e: any) {
      NetworkPolicyHandler.watcherReq = undefined;
      log.log(e.message);
    }
  },
  async watchResources(...args) {
    const requestPath: string = args[2]?.namespace
      ? `/apis/networking.k8s.io/v1/namespaces/${args[2].namespace}/networkpolicies`
      : `/apis/networking.k8s.io/v1/networkpolicies`;
    clusterResourceWatcher(NetworkPolicyHandler, requestPath, args[0], args[1], args[2], args[3]);
    return NetworkPolicyHandler.listResourcesInCluster(args[1], args[2], args[3]);
  },
};

export default NetworkPolicyHandler;
