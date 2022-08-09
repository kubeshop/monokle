import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {clusterResourceWatcher} from '.';
import {PodOutgoingRefMappers} from './common/outgoingRefMappers';

const DeploymentHandler: ResourceKindHandler = {
  kind: 'Deployment',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.WORKLOADS, 'Deployments'],
  clusterApiVersion: 'apps/v1',
  validationSchemaPrefix: 'io.k8s.api.apps.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
    const k8sAppV1Api = kubeconfig.makeApiClient(k8s.AppsV1Api);
    return k8sAppV1Api.readNamespacedDeployment(resource.name, resource.namespace || 'default', 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const k8sAppV1Api = kubeconfig.makeApiClient(k8s.AppsV1Api);
    const response = namespace
      ? await k8sAppV1Api.listNamespacedDeployment(namespace)
      : await k8sAppV1Api.listDeploymentForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
    const k8sAppV1Api = kubeconfig.makeApiClient(k8s.AppsV1Api);
    await k8sAppV1Api.deleteNamespacedDeployment(resource.name, resource.namespace || 'default');
  },
  outgoingRefMappers: [...PodOutgoingRefMappers],
  helpLink: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/',
  watcherReq: undefined,
  disconnectFromCluster() {
    try {
      DeploymentHandler.watcherReq.abort();
      DeploymentHandler.watcherReq = undefined;
    } catch (e: any) {
      DeploymentHandler.watcherReq = undefined;
    }
  },
  async watchResources(...args) {
    const requestPath: string = args[2]?.namespace
      ? `/apis/apps/v1/namespaces/${args[2].namespace}/deployments`
      : `/apis/apps/v1/deployments`;
    clusterResourceWatcher(DeploymentHandler, requestPath, args[0], args[1], args[2], args[3]);
    return DeploymentHandler.listResourcesInCluster(args[1], args[2], args[3]);
  },
};

export default DeploymentHandler;
