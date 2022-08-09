import * as k8s from '@kubernetes/client-node';

import log from 'loglevel';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {clusterResourceWatcher} from '.';

const LimitRangeHandler: ResourceKindHandler = {
  kind: 'LimitRange',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.CONFIGURATION, 'Limit Ranges'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.core.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    return k8sCoreV1Api.readNamespacedLimitRange(resource.name, resource.namespace || 'default', 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    const response = namespace
      ? await k8sCoreV1Api.listNamespacedLimitRange(namespace)
      : await k8sCoreV1Api.listLimitRangeForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    await k8sCoreV1Api.deleteNamespacedLimitRange(resource.name, resource.namespace || 'default');
  },
  helpLink: 'https://kubernetes.io/docs/concepts/policy/limit-range/',
  watcherReq: undefined,
  disconnectFromCluster() {
    try {
      LimitRangeHandler.watcherReq.abort();
      LimitRangeHandler.watcherReq = undefined;
    } catch (e: any) {
      LimitRangeHandler.watcherReq = undefined;
      log.log(e.message);
    }
  },
  async watchResources(...args) {
    const requestPath: string = args[2]?.namespace
      ? `/api/v1/namespaces/${args[2].namespace}/limitranges`
      : `/api/v1/limitranges`;
    clusterResourceWatcher(LimitRangeHandler, requestPath, args[0], args[1], args[2], args[3]);
    return LimitRangeHandler.listResourcesInCluster(args[1], args[2], args[3]);
  },
};

export default LimitRangeHandler;
