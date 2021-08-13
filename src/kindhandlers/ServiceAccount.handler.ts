import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';

const ServiceAccountHandler: ResourceKindHandler = {
  kind: 'ServiceAccount',
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
      source: {path: ['secrets']},
      target: {kind: 'Secret', path: ['metadata', 'name']},
    },
  ],
};

export default ServiceAccountHandler;
