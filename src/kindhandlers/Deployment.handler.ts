import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';
import {NAV_K8S_RESOURCES, SECTION_WORKLOADS} from '@constants/navigator';
import {PodOutgoingRefMappers} from './common/outgoingRefMappers';

const DeploymentHandler: ResourceKindHandler = {
  kind: 'Deployment',
  apiVersionMatcher: '**',
  navigatorPath: [NAV_K8S_RESOURCES, SECTION_WORKLOADS, 'Deployments'],
  clusterApiVersion: 'apps/v1',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string, namespace: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.AppsV1Api);
    return k8sCoreV1Api.readNamespacedDeployment(name, namespace, 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sAppV1Api = kubeconfig.makeApiClient(k8s.AppsV1Api);
    const response = await k8sAppV1Api.listDeploymentForAllNamespaces();
    return response.body.items;
  },
  outgoingRefMappers: [
    ...PodOutgoingRefMappers,
    {
      source: {
        pathParts: ['spec', 'template', 'metadata', 'labels'],
      },
      target: {
        kind: 'Service',
        pathParts: ['spec', 'selector'],
      },
      matchPairs: true,
    },
  ],
};

export default DeploymentHandler;
