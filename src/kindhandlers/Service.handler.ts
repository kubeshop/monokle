import * as k8s from '@kubernetes/client-node';

import log from 'loglevel';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {createPodSelectorOutgoingRefMappers} from '@src/kindhandlers/common/outgoingRefMappers';

import {clusterResourceWatcher} from '.';

const ServiceHandler: ResourceKindHandler = {
  kind: 'Service',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.NETWORK, 'Services'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.core.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    return k8sCoreV1Api.readNamespacedService(resource.name, resource.namespace || 'default');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    const response = namespace
      ? await k8sCoreV1Api.listNamespacedService(namespace)
      : await k8sCoreV1Api.listServiceForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    await k8sCoreV1Api.deleteNamespacedService(resource.name, resource.namespace || 'default');
  },
  outgoingRefMappers: createPodSelectorOutgoingRefMappers(),
  helpLink: 'https://kubernetes.io/docs/concepts/services-networking/service/',
  watcherReq: undefined,
  disconnectFromCluster() {
    try {
      ServiceHandler.watcherReq.abort();
      ServiceHandler.watcherReq = undefined;
    } catch (e: any) {
      ServiceHandler.watcherReq = undefined;
      log.log(e.message);
    }
  },
  async watchResources(...args) {
    const requestPath: string = args[2]?.namespace
      ? `/api/v1/namespaces/${args[2].namespace}/services`
      : `/api/v1/services`;
    clusterResourceWatcher(ServiceHandler, requestPath, args[0], args[1], args[2], args[3]);
    return ServiceHandler.listResourcesInCluster(args[1], args[2], args[3]);
  },
};

export default ServiceHandler;
