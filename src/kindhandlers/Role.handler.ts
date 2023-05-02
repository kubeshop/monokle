import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const RoleHandler: ResourceKindHandler = {
  kind: 'Role',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.ACCESS_CONTROL, 'Roles'],
  clusterApiVersion: 'rbac.authorization.k8s.io/v1',
  validationSchemaPrefix: 'io.k8s.api.rbac.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta): Promise<any> {
    const k8sRbacV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    k8sRbacV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    return k8sRbacV1Api.readNamespacedRole(resource.name, resource.namespace || 'default');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const k8sRbacV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    k8sRbacV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    const response = namespace
      ? await k8sRbacV1Api.listNamespacedRole(namespace)
      : await k8sRbacV1Api.listRoleForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta) {
    const k8sRbacV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    k8sRbacV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    await k8sRbacV1Api.deleteNamespacedRole(resource.name, resource.namespace || 'default');
  },
  helpLink: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole',
};

export default RoleHandler;
