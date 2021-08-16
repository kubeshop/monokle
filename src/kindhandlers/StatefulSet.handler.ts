import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';
import {NAV_K8S_RESOURCES, SECTION_WORKLOADS} from '@constants/navigator';
import {PodOutgoingRefMappers} from './common/outgoingRefMappers';

const StatefulSetHandler: ResourceKindHandler = {
  kind: 'StatefulSet',
  apiVersionMatcher: '*',
  navigatorPath: [NAV_K8S_RESOURCES, SECTION_WORKLOADS, 'StatefulSets'],
  clusterApiVersion: 'apps/v1',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string, namespace: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.AppsV1Api);
    return k8sCoreV1Api.readNamespacedStatefulSet(name, namespace, 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sAppV1Api = kubeconfig.makeApiClient(k8s.AppsV1Api);
    const response = await k8sAppV1Api.listStatefulSetForAllNamespaces();
    return response.body.items;
  },
  outgoingRefMappers: [...PodOutgoingRefMappers],
};

export default StatefulSetHandler;
