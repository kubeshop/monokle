import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const StorageClassHandler: ResourceKindHandler = {
  kind: 'StorageClass',
  apiVersionMatcher: '**',
  isNamespaced: false,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.STORAGE, 'StorageClasses'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.storage.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta): Promise<any> {
    const storageV1Api = kubeconfig.makeApiClient(k8s.StorageV1Api);
    storageV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    return storageV1Api.readStorageClass(resource.name, 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const storageV1Api = kubeconfig.makeApiClient(k8s.StorageV1Api);
    storageV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    const response = await storageV1Api.listStorageClass();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta) {
    const storageV1Api = kubeconfig.makeApiClient(k8s.StorageV1Api);
    storageV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    await storageV1Api.deleteStorageClass(resource.name);
  },
  helpLink: 'https://kubernetes.io/docs/concepts/storage/storage-classes/',
};

export default StorageClassHandler;
