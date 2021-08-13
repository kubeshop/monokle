import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';

const RoleBindingHandler: ResourceKindHandler = {
  kind: 'RoleBinding',
  apiVersionMatcher: '*',
  clusterApiVersion: 'rbac.authorization.k8s.io/v1',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string, namespace: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    return k8sCoreV1Api.readNamespacedRoleBinding(name, namespace);
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sRbacV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    const response = await k8sRbacV1Api.listRoleBindingForAllNamespaces();
    return response.body.items;
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
