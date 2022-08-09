import * as k8s from '@kubernetes/client-node';

import log from 'loglevel';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {clusterResourceWatcher} from '.';

const StorageClassHandler: ResourceKindHandler = {
  kind: 'StorageClass',
  apiVersionMatcher: '**',
  isNamespaced: false,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.STORAGE, 'StorageClasses'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.storage.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
    const storageV1Api = kubeconfig.makeApiClient(k8s.StorageV1Api);
    return storageV1Api.readStorageClass(resource.name, 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const storageV1Api = kubeconfig.makeApiClient(k8s.StorageV1Api);
    const response = await storageV1Api.listStorageClass();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
    const storageV1Api = kubeconfig.makeApiClient(k8s.StorageV1Api);
    await storageV1Api.deleteStorageClass(resource.name);
  },
  helpLink: 'https://kubernetes.io/docs/concepts/storage/storage-classes/',
  watcherReq: undefined,
  disconnectFromCluster() {
    try {
      StorageClassHandler.watcherReq.abort();
      StorageClassHandler.watcherReq = undefined;
    } catch (e: any) {
      StorageClassHandler.watcherReq = undefined;
      log.log(e.message);
    }
  },
  async watchResources(...args) {
    const requestPath: string = `/apis/storage.k8s.io/v1/storageclasses`;
    clusterResourceWatcher(StorageClassHandler, requestPath, args[0], args[1], args[2], args[3]);
    return StorageClassHandler.listResourcesInCluster(args[1], args[2], args[3]);
  },
};

export default StorageClassHandler;
