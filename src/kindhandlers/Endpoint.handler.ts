import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';

const EndpointHandler: ResourceKindHandler = {
  kind: 'Endpoint',
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
        path: ['metadata', 'name'],
      },
      target: {
        kind: 'Service',
        path: ['metadata', 'name'],
      },
    },
  ],
};

export default EndpointHandler;
