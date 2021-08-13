import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';
import {PodOutgoingRefMappers} from './common/outgoingRefMappers';

const CronJobHandler: ResourceKindHandler = {
  kind: 'CronJob',
  apiVersionMatcher: '*',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string, namespace: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.BatchV1Api);
    return k8sCoreV1Api.readNamespacedCronJob(name, namespace, 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sBatchV1Api = kubeconfig.makeApiClient(k8s.BatchV1Api);
    const response = await k8sBatchV1Api.listCronJobForAllNamespaces();
    return response.body.items;
  },
  outgoingRefMappers: [...PodOutgoingRefMappers],
};

export default CronJobHandler;
