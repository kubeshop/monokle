import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const PersistentVolumeHandler: ResourceKindHandler = {
  kind: 'PersistentVolume',
  apiVersionMatcher: '**',
  isNamespaced: false,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.STORAGE, 'PersistentVolumes'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.core.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    k8sCoreV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    return k8sCoreV1Api.readPersistentVolume(resource.name);
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    k8sCoreV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    const response = await k8sCoreV1Api.listPersistentVolume();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    k8sCoreV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    await k8sCoreV1Api.deletePersistentVolume(resource.name);
  },
  helpLink: 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/',
};

export default PersistentVolumeHandler;
