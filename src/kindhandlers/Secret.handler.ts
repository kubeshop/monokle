import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {clusterResourceWatcher} from '.';

const SecretHandler: ResourceKindHandler = {
  kind: 'Secret',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.CONFIGURATION, 'Secrets'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.core.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    return k8sCoreV1Api.readNamespacedSecret(resource.name, resource.namespace || 'default', 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    const response = namespace
      ? await k8sCoreV1Api.listNamespacedSecret(namespace)
      : await k8sCoreV1Api.listSecretForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    await k8sCoreV1Api.deleteNamespacedSecret(resource.name, resource.namespace || 'default');
  },
  outgoingRefMappers: [
    {
      source: {
        pathParts: ['metadata', 'annotations', 'kubernetes.io/service-account.name'],
      },
      target: {
        kind: 'ServiceAccount',
      },
      type: 'name',

      shouldCreateUnsatisfiedRef: (refMapper, sourceResource, values) => {
        return values['kubernetes.io/service-account.name'] !== 'default';
      },
    },
  ],
  helpLink: 'https://kubernetes.io/docs/concepts/configuration/secret/',
  watcherReq: undefined,
  disconnectFromCluster() {
    try {
      SecretHandler.watcherReq.abort();
      SecretHandler.watcherReq = undefined;
    } catch (e: any) {
      SecretHandler.watcherReq = undefined;
    }
  },
  async watchResources(...args) {
    const requestPath: string = args[2]?.namespace
      ? `/api/v1/namespaces/${args[2].namespace}/secrets`
      : `/api/v1/secrets`;
    clusterResourceWatcher(SecretHandler, requestPath, args[0], args[1], args[2], args[3]);
    return SecretHandler.listResourcesInCluster(args[1], args[2], args[3]);
  },
};

export default SecretHandler;
