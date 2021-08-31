import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';
import {NAV_K8S_RESOURCES, SECTION_NETWORK} from '@constants/navigator';

const ServiceHandler: ResourceKindHandler = {
  kind: 'Service',
  apiVersionMatcher: '**',
  navigatorPath: [NAV_K8S_RESOURCES, SECTION_NETWORK, 'Services'],
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
  outgoingRefMappers: [
    {
      source: {
        pathParts: ['spec', 'selector'],
      },
      target: {
        kind: 'Deployment',
        pathParts: ['spec', 'template', 'metadata', 'labels'],
      },
      matchPairs: true,
    },
  ],
};

export default ServiceHandler;
