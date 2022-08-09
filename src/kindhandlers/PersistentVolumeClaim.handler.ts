import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {clusterResourceWatcher} from '.';

const PersistentVolumeClaimHandler: ResourceKindHandler = {
  kind: 'PersistentVolumeClaim',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.STORAGE, 'PersistentVolumeClaims'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.core.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    return k8sCoreV1Api.readNamespacedPersistentVolumeClaim(resource.name, resource.namespace || 'default', 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    const response = namespace
      ? await k8sCoreV1Api.listNamespacedPersistentVolumeClaim(namespace)
      : await k8sCoreV1Api.listPersistentVolumeClaimForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    await k8sCoreV1Api.deleteNamespacedPersistentVolumeClaim(resource.name, resource.namespace || 'default');
  },
  outgoingRefMappers: [
    {
      source: {
        pathParts: ['spec', 'volumeName'],
      },
      target: {
        kind: 'PersistentVolume',
      },
      type: 'name',
    },
  ],
  helpLink: 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/#expanding-persistent-volumes-claims',
  watcherReq: undefined,
  disconnectFromCluster() {
    try {
      PersistentVolumeClaimHandler.watcherReq.abort();
      PersistentVolumeClaimHandler.watcherReq = undefined;
    } catch (e: any) {
      PersistentVolumeClaimHandler.watcherReq = undefined;
    }
  },
  async watchResources(...args) {
    const requestPath: string = args[2]?.namespace
      ? `/api/v1/namespaces/${args[2].namespace}/persistentvolumeclaims`
      : `/api/v1/persistentvolumeclaims`;
    clusterResourceWatcher(PersistentVolumeClaimHandler, requestPath, args[0], args[1], args[2], args[3]);
    return PersistentVolumeClaimHandler.listResourcesInCluster(args[1], args[2], args[3]);
  },
};

export default PersistentVolumeClaimHandler;
