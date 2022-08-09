import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {clusterResourceWatcher} from '.';

const NamespaceHandler: ResourceKindHandler = {
  kind: 'Namespace',
  apiVersionMatcher: '**',
  isNamespaced: false,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.CONFIGURATION, 'Namespaces'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.core.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    return k8sCoreV1Api.readNamespace(resource.name, 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    const response = await k8sCoreV1Api.listNamespace();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    await k8sCoreV1Api.deleteNamespace(resource.name);
  },
  helpLink: 'https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/',
  watcherReq: undefined,
  disconnectFromCluster() {
    try {
      NamespaceHandler.watcherReq.abort();
      NamespaceHandler.watcherReq = undefined;
    } catch (e: any) {
      NamespaceHandler.watcherReq = undefined;
    }
  },
  async watchResources(...args) {
    const requestPath = `/api/v1/namespaces`;
    clusterResourceWatcher(NamespaceHandler, requestPath, args[0], args[1], args[2], args[3]);
    return NamespaceHandler.listResourcesInCluster(args[1], args[2], args[3]);
  },
};

export default NamespaceHandler;
