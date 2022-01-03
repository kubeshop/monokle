import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {targetGroupMatcher, targetKindMatcher} from '@src/kindhandlers/common/customMatchers';

const ClusterRoleBindingHandler: ResourceKindHandler = {
  kind: 'ClusterRoleBinding',
  apiVersionMatcher: '**',
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.ACCESS_CONTROL, 'ClusterRoleBindings'],
  clusterApiVersion: 'rbac.authorization.k8s.io/v1',
  validationSchemaPrefix: 'io.k8s.api.rbac.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
    const k8sRbacV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    return k8sRbacV1Api.readClusterRoleBinding(resource.name);
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sRbacV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    const response = await k8sRbacV1Api.listClusterRoleBinding();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
    const k8sRbacV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    await k8sRbacV1Api.deleteClusterRoleBinding(resource.name);
  },
  outgoingRefMappers: [
    // see https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#roleref-v1-rbac-authorization-k8s-io
    {
      source: {
        pathParts: ['roleRef', 'name'],
        siblingMatchers: {
          kind: targetKindMatcher,
          apiGroup: targetGroupMatcher,
        },
      },
      target: {
        kind: '$.*',
      },
      type: 'name',
    },
    // see https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#subject-v1-rbac-authorization-k8s-io
    {
      source: {
        pathParts: ['subjects', '*', 'name'],
        siblingMatchers: {
          kind: (sourceResource: K8sResource, targetResource, value) => {
            return ['User', 'Group', 'ServiceAccount'].includes(value) && targetResource.kind === value;
          },
          apiGroup: (sourceResource: K8sResource, targetResource, value, siblingValues) => {
            const apiGroup =
              value || ['User', 'Group'].includes(siblingValues['kind']) ? 'rbac.authorization.k8s.io' : '';
            return targetResource.version.startsWith(apiGroup);
          },
          namespace: (sourceResource: K8sResource, targetResource, value, siblingValues) => {
            return ['User', 'Group'].includes(siblingValues['kind'])
              ? !value
              : targetResource.namespace === (value || sourceResource.namespace);
          },
        },
      },
      target: {
        kind: '$(User|Group|ServiceAccount)',
      },
      type: 'name',

      // ignore refs to Users or Groups
      shouldCreateUnsatisfiedRef: (refMapper, sourceResource, values) => {
        const kind = values['kind'];
        return kind !== 'User' && kind !== 'Group';
      },
    },
  ],
  helpLink: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding',
};

export default ClusterRoleBindingHandler;
