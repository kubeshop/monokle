import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';
import {NAV_K8S_RESOURCES, SECTION_WORKLOADS} from '@constants/navigator';
import {PodOutgoingRefMappers} from './common/outgoingRefMappers';

const JobHandler: ResourceKindHandler = {
  kind: 'Job',
  apiVersionMatcher: '**',
  navigatorPath: [NAV_K8S_RESOURCES, SECTION_WORKLOADS, 'Jobs'],
  clusterApiVersion: 'batch/v1',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string, namespace: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.BatchV1Api);
    return k8sCoreV1Api.readNamespacedJob(name, namespace, 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sBatchV1Api = kubeconfig.makeApiClient(k8s.BatchV1Api);
    const response = await k8sBatchV1Api.listJobForAllNamespaces();
    return response.body.items;
  },
  outgoingRefMappers: [...PodOutgoingRefMappers],
};

export default JobHandler;
