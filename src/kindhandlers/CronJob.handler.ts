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
  listResourcesInCluster(kubeconfig: k8s.KubeConfig): Promise<any[]> {
    return Promise.resolve([]);
  },
  outgoingRefMappers: [...PodOutgoingRefMappers],
};

export default CronJobHandler;
