import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';

const PersistentVolumeClaimHandler: ResourceKindHandler = {
  kind: 'PersistentVolumeClaim',
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
        path: ['spec', 'volumeName'],
      },
      target: {
        kind: 'PersistentVolume',
        path: ['metadata', 'name'],
      },
    },
  ],
};

export default PersistentVolumeClaimHandler;
