import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';

const SecretHandler: ResourceKindHandler = {
  kind: 'Secret',
  apiVersionMatcher: '*',
  description: '',
  getResourceFromCluster(name: string, namespace: string, kubeconfig: k8s.KubeConfig): Promise<any> {
    return Promise.resolve();
  },
  listResourcesInCluster(kubeconfig: k8s.KubeConfig): Promise<any[]> {
    return Promise.resolve([]);
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
