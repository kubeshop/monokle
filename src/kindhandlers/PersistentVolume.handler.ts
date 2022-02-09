import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {explicitNamespaceMatcher} from '@src/kindhandlers/common/customMatchers';
import {SecretTarget} from '@src/kindhandlers/common/outgoingRefMappers';

const PersistentVolumeHandler: ResourceKindHandler = {
  kind: 'PersistentVolume',
  apiVersionMatcher: '**',
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.STORAGE, 'PersistentVolumes'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.core.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    return k8sCoreV1Api.readPersistentVolume(resource.name);
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    const response = await k8sCoreV1Api.listPersistentVolume();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    await k8sCoreV1Api.deletePersistentVolume(resource.name);
  },
  outgoingRefMappers: [
    {
      source: {
        pathParts: ['spec', 'claimRef', 'name'],
      },
      target: {
        kind: 'PersistentVolumeClaim',
      },
      type: 'name',
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
    {
      // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.22/#azurefilevolumesource-v1-core
      source: {
        pathParts: ['volumes', '*', 'azureFile', 'secretName'],
      },
      type: 'name',
      ...SecretTarget,
    },
    {
      source: {
        pathParts: ['spec', 'claimRef'],
        siblingMatchers: {
          kind: (sourceResource, targetResource, value) => {
            return value === undefined || targetResource.kind === value;
          },
          apiVersion: (sourceResource, targetResource, value) => {
            return value === undefined || targetResource.apiVersion.startsWith(value);
          },
          namespace: (sourceResource, targetResource, value) => {
            return value === undefined || targetResource.namespace === value;
          },
          uid: (sourceResource, targetResource, value) => {
            return value === undefined || targetResource.id === value;
          },
        },
      },
      target: {
        kind: 'PersistentVolumeClaim',
      },
      type: 'name',
    },
  ],
  helpLink: 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/',
};

export default PersistentVolumeHandler;
