import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {NamespaceRefTypeEnum, ResourceKindHandler} from '@models/resourcekindhandler';

import {SecretTarget} from '@src/kindhandlers/common/outgoingRefMappers';

const PersistentVolumeHandler: ResourceKindHandler = {
  kind: 'PersistentVolume',
  apiVersionMatcher: '**',
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.STORAGE, 'PersistentVolumes'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.core.v1',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    return k8sCoreV1Api.readPersistentVolume(name);
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    const response = await k8sCoreV1Api.listPersistentVolume();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, name: string) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    await k8sCoreV1Api.deletePersistentVolume(name);
  },
  outgoingRefMappers: [
    {
      source: {
        pathParts: ['spec', 'claimRef', 'name'],
      },
      target: {kind: 'PersistentVolumeClaim', pathParts: ['metadata', 'name']},
    },
    {
      // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#secretreference-v1-core
      source: {
        pathParts: ['secretRef', 'name'],
        namespaceRef: NamespaceRefTypeEnum.Explicit,
      },
      ...SecretTarget,
    },
    {
      // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#azurefilepersistentvolumesource-v1-core
      source: {
        pathParts: ['spec', 'azureFile', 'secretName'],
        namespaceRef: NamespaceRefTypeEnum.Explicit,
        namespaceProperty: 'secretNamespace',
      },
      ...SecretTarget,
    },
    {
      // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#azurefilevolumesource-v1-core
      source: {
        pathParts: ['volumes', '*', 'azureFile', 'secretName'],
      },
      ...SecretTarget,
    },
  ],
  helpLink: 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/',
};

export default PersistentVolumeHandler;
