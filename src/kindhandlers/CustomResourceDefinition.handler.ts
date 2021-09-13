import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';
import navSectionNames from '@constants/navSectionNames';

const CustomResourceDefinitionHandler: ResourceKindHandler = {
  kind: 'CustomResourceDefinition',
  apiVersionMatcher: '**',
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.CUSTOM_RESOURCES, 'Custom Resources'],
  clusterApiVersion: 'apiextensions.k8s.io/v1',
  validationSchemaPrefix: 'io.k8s.apiextensions-apiserver.pkg.apis.apiextensions.v1',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.ApiextensionsV1Api);
    return k8sCoreV1Api.readCustomResourceDefinition(name);
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sExtensionsV1Api = kubeconfig.makeApiClient(k8s.ApiextensionsV1Api);
    const response = await k8sExtensionsV1Api.listCustomResourceDefinition();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, name: string) {
    const k8sExtensionsV1Api = kubeconfig.makeApiClient(k8s.ApiextensionsV1Api);
    await k8sExtensionsV1Api.deleteCustomResourceDefinition(name);
  },
};

export default CustomResourceDefinitionHandler;
