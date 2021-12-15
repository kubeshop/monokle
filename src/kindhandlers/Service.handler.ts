import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {RefMapper, ResourceKindHandler} from '@models/resourcekindhandler';

function createSelectorOutgoingRefMappers(targetResourceKind: string): RefMapper {
  return {
    source: {
      pathParts: ['spec', 'selector'],
    },
    target: {
      kind: targetResourceKind,
      pathParts: ['spec', 'template', 'metadata', 'labels'],
    },
    type: 'pairs',
  };
}

const ServiceHandler: ResourceKindHandler = {
  kind: 'Service',
  apiVersionMatcher: '**',
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.NETWORK, 'Services'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.core.v1',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string, namespace: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    return k8sCoreV1Api.readNamespacedService(name, namespace, 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    const response = await k8sCoreV1Api.listServiceForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, name: string, namespace?: string) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    await k8sCoreV1Api.deleteNamespacedService(name, namespace || 'default');
  },
  outgoingRefMappers: [
    {
      source: {
        pathParts: ['spec', 'selector'],
      },
      target: {
        kind: 'Pod',
        pathParts: ['metadata', 'labels'],
      },
      type: 'pairs',
    },
    createSelectorOutgoingRefMappers('DaemonSet'),
    createSelectorOutgoingRefMappers('Deployment'),
    createSelectorOutgoingRefMappers('Job'),
    createSelectorOutgoingRefMappers('ReplicaSet'),
    createSelectorOutgoingRefMappers('ReplicationController'),
    createSelectorOutgoingRefMappers('StatefulSet'),
  ],
  helpLink: 'https://kubernetes.io/docs/concepts/services-networking/service/',
};

export default ServiceHandler;
