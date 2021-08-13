import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';

const ClusterRoleHandler: ResourceKindHandler = {
  kind: 'ClusterRole',
  apiVersionMatcher: '*',
  clusterApiVersion: 'rbac.authorization.k8s.io/v1',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    return k8sCoreV1Api.readClusterRole(name);
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sRbacV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    const response = await k8sRbacV1Api.listClusterRole();
    return response.body.items;
  },
};

export default ClusterRoleHandler;
