import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';

const RoleBindingHandler: ResourceKindHandler = {
  kind: 'RoleBinding',
  apiVersionMatcher: '*',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string, namespace: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    return k8sCoreV1Api.readNamespacedRoleBinding(name, namespace);
  },
  listResourcesInCluster(kubeconfig: k8s.KubeConfig): Promise<any[]> {
    return Promise.resolve([]);
  },
  outgoingRefMappers: [
    {
      source: {
        path: ['roleRef', 'name'],
      },
      target: {
        kind: 'ClusterRoleBinding',
        path: ['metadata', 'name'],
      },
    },
    {
      source: {
        path: ['roleRef', 'name'],
      },
      target: {
        kind: 'Role',
        path: ['metadata', 'name'],
      },
    },
  ],
};

export default RoleBindingHandler;
