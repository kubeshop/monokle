import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const DeploymentHandler: ResourceKindHandler = {
  kind: 'Deployment',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.WORKLOADS, 'Deployments'],
  clusterApiVersion: 'apps/v1',
  validationSchemaPrefix: 'io.k8s.api.apps.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta): Promise<any> {
    const k8sAppV1Api = kubeconfig.makeApiClient(k8s.AppsV1Api);
    k8sAppV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    return k8sAppV1Api.readNamespacedDeployment(resource.name, resource.namespace || 'default', 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const k8sAppV1Api = kubeconfig.makeApiClient(k8s.AppsV1Api);
    k8sAppV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    const response = namespace
      ? await k8sAppV1Api.listNamespacedDeployment(namespace)
      : await k8sAppV1Api.listDeploymentForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta) {
    const k8sAppV1Api = kubeconfig.makeApiClient(k8s.AppsV1Api);
    k8sAppV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    await k8sAppV1Api.deleteNamespacedDeployment(resource.name, resource.namespace || 'default');
  },
  helpLink: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/',
};

export default DeploymentHandler;
