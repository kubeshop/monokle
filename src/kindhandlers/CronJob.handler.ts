import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';
import {NAV_K8S_RESOURCES, SECTION_WORKLOADS} from '@constants/navigator';
import {PodOutgoingRefMappers} from './common/outgoingRefMappers';

const CronJobHandler: ResourceKindHandler = {
  kind: 'CronJob',
  apiVersionMatcher: '**',
  navigatorPath: [NAV_K8S_RESOURCES, SECTION_WORKLOADS, 'CronJobs'],
  clusterApiVersion: 'batch/v1',
  validationSchemaPrefix: 'io.k8s.api.batch.v1',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string, namespace: string): Promise<any> {
    const k8sBatchV1Api = kubeconfig.makeApiClient(k8s.BatchV1Api);
    return k8sBatchV1Api.readNamespacedCronJob(name, namespace, 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sBatchV1Api = kubeconfig.makeApiClient(k8s.BatchV1Api);
    const response = await k8sBatchV1Api.listCronJobForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, name: string, namespace?: string) {
    const k8sBatchV1Api = kubeconfig.makeApiClient(k8s.BatchV1Api);
    await k8sBatchV1Api.deleteNamespacedCronJob(name, namespace || 'default');
  },
  outgoingRefMappers: [...PodOutgoingRefMappers],
};

export default CronJobHandler;
