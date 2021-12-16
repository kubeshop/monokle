import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {NamespaceRefTypeEnum, ResourceKindHandler} from '@models/resourcekindhandler';

import {SecretTarget} from '@src/kindhandlers/common/outgoingRefMappers';

const VolumeAttachmentHandler: ResourceKindHandler = {
  kind: 'VolumeAttachment',
  apiVersionMatcher: '**',
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.STORAGE, 'VolumeAttachments'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'storage.k8s.io.v1',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
    const k8sStorageApi = kubeconfig.makeApiClient(k8s.StorageV1Api);
    return k8sStorageApi.readVolumeAttachment(resource.name);
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sStorageApi = kubeconfig.makeApiClient(k8s.StorageV1Api);
    const response = await k8sStorageApi.listVolumeAttachment();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
    const k8sStorageApi = kubeconfig.makeApiClient(k8s.StorageV1Api);
    await k8sStorageApi.deleteVolumeAttachment(resource.name);
  },
  outgoingRefMappers: [
    {
      // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#azurefilepersistentvolumesource-v1-core
      source: {
        pathParts: ['inlineVolumeSpec', 'azureFile', 'secretName'],
        namespaceRef: NamespaceRefTypeEnum.Explicit,
        namespaceProperty: 'secretNamespace',
      },
      type: 'name',
      ...SecretTarget,
    },
    {
      // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#secretreference-v1-core
      source: {
        pathParts: ['secretRef', 'name'],
        namespaceRef: NamespaceRefTypeEnum.Explicit,
      },
      type: 'name',
      ...SecretTarget,
    },
    {
      // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#azurefilepersistentvolumesource-v1-core
      source: {
        pathParts: ['spec', 'azureFile', 'secretName'],
        namespaceRef: NamespaceRefTypeEnum.Explicit,
        namespaceProperty: 'secretNamespace',
      },
      type: 'name',
      ...SecretTarget,
    },
  ],
  helpLink: 'https://kubernetes.io/docs/concepts/storage/volumes/',
};

export default VolumeAttachmentHandler;
