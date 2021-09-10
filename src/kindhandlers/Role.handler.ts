import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';
import {NAV_K8S_RESOURCES, SECTION_ACCESS_CONTROL} from '@constants/navigator';

const RoleHandler: ResourceKindHandler = {
  kind: 'Role',
  apiVersionMatcher: '**',
  navigatorPath: [NAV_K8S_RESOURCES, SECTION_ACCESS_CONTROL, 'Roles'],
  clusterApiVersion: 'rbac.authorization.k8s.io/v1',
  validationSchemaPrefix: 'io.k8s.api.rbac.v1',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string, namespace: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    return k8sCoreV1Api.readNamespacedRole(name, namespace);
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sRbacV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    const response = await k8sRbacV1Api.listRoleForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, name: string, namespace?: string) {
    const k8sRbacV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    await k8sRbacV1Api.deleteNamespacedRole(name, namespace || 'default');
  },
};

export default RoleHandler;
