import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';

const RoleBindingHandler: ResourceKindHandler = {
  kind: 'RoleBinding',
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
