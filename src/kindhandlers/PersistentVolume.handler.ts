import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';

const PersistentVolumeHandler: ResourceKindHandler = {
  kind: 'PersistentVolume',
  apiVersionMatcher: '*',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    return k8sCoreV1Api.readPersistentVolume(name);
  },
  listResourcesInCluster(kubeconfig: k8s.KubeConfig): Promise<any[]> {
    return Promise.resolve([]);
  },
  outgoingRefMappers: [
    {
      source: {
        path: ['spec', 'claimRef', 'name'],
      },
      target: {kind: 'PersistentVolumeClaim', path: ['metadata', 'name']},
    },
  ],
};

export default PersistentVolumeHandler;
