import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';

const PersistentVolumeClaimHandler: ResourceKindHandler = {
  kind: 'PersistentVolumeClaim',
  apiVersionMatcher: '*',
  clusterApiVersion: 'v1',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string, namespace: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    return k8sCoreV1Api.readNamespacedPersistentVolumeClaim(name, namespace, 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    const response = await k8sCoreV1Api.listPersistentVolumeClaimForAllNamespaces();
    return response.body.items;
  },
  outgoingRefMappers: [
    {
      source: {
        pathParts: ['spec', 'volumeName'],
      },
      target: {
        kind: 'PersistentVolume',
        pathParts: ['metadata', 'name'],
      },
    },
  ],
};

export default PersistentVolumeClaimHandler;
