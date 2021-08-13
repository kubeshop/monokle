import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';

const PersistentVolumeHandler: ResourceKindHandler = {
  kind: 'PersistentVolume',
  apiVersionMatcher: '*',
  clusterApiVersion: 'v1',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    return k8sCoreV1Api.readPersistentVolume(name);
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    const response = await k8sCoreV1Api.listPersistentVolume();
    return response.body.items;
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
