import * as k8s from '@kubernetes/client-node';

import log from 'loglevel';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {explicitNamespaceMatcher} from '@src/kindhandlers/common/customMatchers';
import {SecretTarget} from '@src/kindhandlers/common/outgoingRefMappers';

import {clusterResourceWatcher} from '.';

const VolumeAttachmentHandler: ResourceKindHandler = {
  kind: 'VolumeAttachment',
  apiVersionMatcher: '**',
  isNamespaced: false,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.STORAGE, 'VolumeAttachments'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.storage.v1',
  isCustom: false,
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
        siblingMatchers: {
          secretNamespace: explicitNamespaceMatcher,
        },
      },
      type: 'name',
      ...SecretTarget,
    },
    {
      // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#secretreference-v1-core
      source: {
        pathParts: ['secretRef', 'name'],
        siblingMatchers: {
          namespace: explicitNamespaceMatcher,
        },
      },
      type: 'name',
      ...SecretTarget,
    },
    {
      // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#azurefilepersistentvolumesource-v1-core
      source: {
        pathParts: ['spec', 'azureFile', 'secretName'],
        siblingMatchers: {
          secretNamespace: explicitNamespaceMatcher,
        },
      },
      type: 'name',
      ...SecretTarget,
    },
  ],
  helpLink: 'https://kubernetes.io/docs/concepts/storage/volumes/',
  watcherReq: undefined,
  disconnectFromCluster() {
    try {
      VolumeAttachmentHandler.watcherReq.abort();
      VolumeAttachmentHandler.watcherReq = undefined;
    } catch (e: any) {
      VolumeAttachmentHandler.watcherReq = undefined;
      log.log(e.message);
    }
  },
  async watchResources(...args) {
    const requestPath: string = `/apis/storage.k8s.io/v1/volumeattachments`;
    clusterResourceWatcher(VolumeAttachmentHandler, requestPath, args[0], args[1], args[2], args[3]);
    return VolumeAttachmentHandler.listResourcesInCluster(args[1], args[2], args[3]);
  },
};

export default VolumeAttachmentHandler;
