import * as k8s from '@kubernetes/client-node';

import log from 'loglevel';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {clusterResourceWatcher} from '.';

const RoleHandler: ResourceKindHandler = {
  kind: 'Role',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.ACCESS_CONTROL, 'Roles'],
  clusterApiVersion: 'rbac.authorization.k8s.io/v1',
  validationSchemaPrefix: 'io.k8s.api.rbac.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
    const k8sRbacV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    return k8sRbacV1Api.readNamespacedRole(resource.name, resource.namespace || 'default');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const k8sRbacV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    const response = namespace
      ? await k8sRbacV1Api.listNamespacedRole(namespace)
      : await k8sRbacV1Api.listRoleForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
    const k8sRbacV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    await k8sRbacV1Api.deleteNamespacedRole(resource.name, resource.namespace || 'default');
  },
  helpLink: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole',
  watcherReq: undefined,
  disconnectFromCluster() {
    try {
      RoleHandler.watcherReq.abort();
      RoleHandler.watcherReq = undefined;
    } catch (e: any) {
      RoleHandler.watcherReq = undefined;
      log.log(e.message);
    }
  },
  async watchResources(...args) {
    const requestPath: string = args[2]?.namespace
      ? `/apis/rbac.authorization.k8s.io/v1/namespaces/${args[2].namespace}/roles`
      : `/apis/rbac.authorization.k8s.io/v1/roles`;
    clusterResourceWatcher(RoleHandler, requestPath, args[0], args[1], args[2], args[3]);
    return RoleHandler.listResourcesInCluster(args[1], args[2], args[3]);
  },
};

export default RoleHandler;
