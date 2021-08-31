import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';
import {NAV_K8S_RESOURCES, SECTION_ACCESS_CONTROL} from '@constants/navigator';

const ClusterRoleBindingHandler: ResourceKindHandler = {
  kind: 'ClusterRoleBinding',
  apiVersionMatcher: '**',
  navigatorPath: [NAV_K8S_RESOURCES, SECTION_ACCESS_CONTROL, 'ClusterRoleBindings'],
  clusterApiVersion: 'rbac.authorization.k8s.io/v1',
  validationSchemaPrefix: 'io.k8s.api.rbac.v1',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    return k8sCoreV1Api.readClusterRoleBinding(name);
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sRbacV1Api = kubeconfig.makeApiClient(k8s.RbacAuthorizationV1Api);
    const response = await k8sRbacV1Api.listClusterRoleBinding();
    return response.body.items;
  },
  outgoingRefMappers: [
    {
      source: {
        pathParts: ['roleRef', 'name'],
      },
      target: {
        kind: 'ClusterRole',
        pathParts: ['metadata', 'name'],
      },
    },
  ],
};

export default ClusterRoleBindingHandler;
