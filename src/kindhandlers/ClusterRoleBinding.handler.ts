import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const ClusterRoleBindingHandler: ResourceKindHandler = {
  kind: 'ClusterRoleBinding',
  apiVersionMatcher: '**',
  isNamespaced: false,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.ACCESS_CONTROL, 'ClusterRoleBindings'],
  clusterApiVersion: 'rbac.authorization.k8s.io/v1',
  validationSchemaPrefix: 'io.k8s.api.rbac.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta) {
    const k8sRbacV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    k8sRbacV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    return k8sRbacV1Api.readClusterRoleBinding(resource.name);
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sRbacV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    k8sRbacV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    const response = await k8sRbacV1Api.listClusterRoleBinding();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta) {
    const k8sRbacV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    k8sRbacV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    await k8sRbacV1Api.deleteClusterRoleBinding(resource.name);
  },
  helpLink: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding',
};

export default ClusterRoleBindingHandler;
