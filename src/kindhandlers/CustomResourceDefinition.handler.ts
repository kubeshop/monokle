import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const CustomResourceDefinitionHandler: ResourceKindHandler = {
  kind: 'CustomResourceDefinition',
  apiVersionMatcher: '**',
  isNamespaced: false,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.CONFIGURATION, 'Definitions'],
  clusterApiVersion: 'apiextensions.k8s.io/v1',
  validationSchemaPrefix: 'io.k8s.apiextensions-apiserver.pkg.apis.apiextensions.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta): Promise<any> {
    const k8sExtensionsV1Api = kubeconfig.makeApiClient(k8s.ApiextensionsV1Api);
    k8sExtensionsV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    return k8sExtensionsV1Api.readCustomResourceDefinition(resource.name);
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sExtensionsV1Api = kubeconfig.makeApiClient(k8s.ApiextensionsV1Api);
    k8sExtensionsV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    const response = await k8sExtensionsV1Api.listCustomResourceDefinition();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta) {
    const k8sExtensionsV1Api = kubeconfig.makeApiClient(k8s.ApiextensionsV1Api);
    k8sExtensionsV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    await k8sExtensionsV1Api.deleteCustomResourceDefinition(resource.name);
  },
  helpLink: 'https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/',
};

export default CustomResourceDefinitionHandler;
