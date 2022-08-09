import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {implicitNamespaceMatcher} from '@src/kindhandlers/common/customMatchers';
import {SecretTarget} from '@src/kindhandlers/common/outgoingRefMappers';

import {clusterResourceWatcher} from '.';

const ServiceAccountHandler: ResourceKindHandler = {
  kind: 'ServiceAccount',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.ACCESS_CONTROL, 'ServiceAccounts'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.core.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    return k8sCoreV1Api.readNamespacedServiceAccount(resource.name, resource.namespace || 'default');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    const response = namespace
      ? await k8sCoreV1Api.listNamespacedServiceAccount(namespace)
      : await k8sCoreV1Api.listServiceAccountForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    await k8sCoreV1Api.deleteNamespacedServiceAccount(resource.name, resource.namespace || 'default');
  },
  outgoingRefMappers: [
    {
      source: {
        pathParts: ['secrets', '*', 'name'],
        siblingMatchers: {
          kind: (sourceResource, targetResource, value) => {
            return value === undefined || targetResource.kind === value;
          },
          apiVersion: (sourceResource, targetResource, value) => {
            return value === undefined || targetResource.version.startsWith(value);
          },
          namespace: (sourceResource, targetResource, value) => {
            return value === undefined || targetResource.namespace === value;
          },
          uid: (sourceResource, targetResource, value) => {
            return value === undefined || targetResource.id === value;
          },
        },
        isOptional: true,
      },
      target: {
        kind: 'Secret',
      },
      type: 'name',
    },
    {
      source: {
        pathParts: ['imagePullSecrets', '*', 'name'],
        siblingMatchers: {
          namespace: implicitNamespaceMatcher,
        },
      },
      type: 'name',
      ...SecretTarget,
    },
  ],
  helpLink: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/',
  watcherReq: undefined,
  disconnectFromCluster() {
    try {
      ServiceAccountHandler.watcherReq.abort();
      ServiceAccountHandler.watcherReq = undefined;
    } catch (e: any) {
      ServiceAccountHandler.watcherReq = undefined;
    }
  },
  async watchResources(...args) {
    const requestPath: string = args[2]?.namespace
      ? `/api/v1/namespaces/${args[2].namespace}/serviceaccounts`
      : `/api/v1/serviceaccounts`;
    clusterResourceWatcher(ServiceAccountHandler, requestPath, args[0], args[1], args[2], args[3]);
    return ServiceAccountHandler.listResourcesInCluster(args[1], args[2], args[3]);
  },
};

export default ServiceAccountHandler;
