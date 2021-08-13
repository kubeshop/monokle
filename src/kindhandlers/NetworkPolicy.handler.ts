import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';

const NetworkPolicyHandler: ResourceKindHandler = {
  kind: 'NetworkPolicy',
  apiVersionMatcher: '*',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string, namespace: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.NetworkingV1Api);
    return k8sCoreV1Api.readNamespacedNetworkPolicy(name, namespace);
  },
  listResourcesInCluster(kubeconfig: k8s.KubeConfig): Promise<any[]> {
    return Promise.resolve([]);
  },
};

export default NetworkPolicyHandler;
