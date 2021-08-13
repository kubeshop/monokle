import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';

const SecretHandler: ResourceKindHandler = {
  kind: 'Secret',
  apiVersionMatcher: '*',
  clusterApiVersion: 'v1',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string, namespace: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    return k8sCoreV1Api.readNamespacedSecret(name, namespace, 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    const response = await k8sCoreV1Api.listSecretForAllNamespaces();
    return response.body.items;
  },
  outgoingRefMappers: [
    {
      source: {
        path: ['metadata', 'annotations', 'kubernetes.io/service-account.name'],
      },
      target: {kind: 'ServiceAccount', path: ['metadata', 'name']},
    },
  ],
};

export default SecretHandler;
