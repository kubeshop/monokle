import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const JobHandler: ResourceKindHandler = {
  kind: 'Job',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.WORKLOADS, 'Jobs'],
  clusterApiVersion: 'batch/v1',
  validationSchemaPrefix: 'io.k8s.api.batch.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta): Promise<any> {
    const k8sBatchV1Api = kubeconfig.makeApiClient(k8s.BatchV1Api);
    k8sBatchV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    return k8sBatchV1Api.readNamespacedJob(resource.name, resource.namespace || 'default', 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const k8sBatchV1Api = kubeconfig.makeApiClient(k8s.BatchV1Api);
    k8sBatchV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    const response = namespace
      ? await k8sBatchV1Api.listNamespacedJob(namespace)
      : await k8sBatchV1Api.listJobForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta) {
    const k8sBatchV1Api = kubeconfig.makeApiClient(k8s.BatchV1Api);
    k8sBatchV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    await k8sBatchV1Api.deleteNamespacedJob(resource.name, resource.namespace || 'default');
  },
  helpLink: 'https://kubernetes.io/docs/concepts/workloads/controllers/job/',
};

export default JobHandler;
