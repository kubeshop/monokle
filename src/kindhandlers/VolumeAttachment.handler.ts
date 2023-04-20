import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const VolumeAttachmentHandler: ResourceKindHandler = {
  kind: 'VolumeAttachment',
  apiVersionMatcher: '**',
  isNamespaced: false,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.STORAGE, 'VolumeAttachments'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.storage.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta): Promise<any> {
    const k8sStorageApi = kubeconfig.makeApiClient(k8s.StorageV1Api);
    k8sStorageApi.setDefaultAuthentication(new k8s.VoidAuth());
    return k8sStorageApi.readVolumeAttachment(resource.name);
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sStorageApi = kubeconfig.makeApiClient(k8s.StorageV1Api);
    k8sStorageApi.setDefaultAuthentication(new k8s.VoidAuth());
    const response = await k8sStorageApi.listVolumeAttachment();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta) {
    const k8sStorageApi = kubeconfig.makeApiClient(k8s.StorageV1Api);
    k8sStorageApi.setDefaultAuthentication(new k8s.VoidAuth());
    await k8sStorageApi.deleteVolumeAttachment(resource.name);
  },
  helpLink: 'https://kubernetes.io/docs/concepts/storage/volumes/',
};

export default VolumeAttachmentHandler;
