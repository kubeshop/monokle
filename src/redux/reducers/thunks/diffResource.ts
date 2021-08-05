import {createAsyncThunk} from '@reduxjs/toolkit';
import {SetDiffDataPayload} from '@redux/reducers/main';
import {AppDispatch, RootState} from '@redux/store';
import * as k8s from '@kubernetes/client-node';
import {stringify} from 'yaml';
import log from 'loglevel';
import {createPreviewRejection} from '@redux/reducers/thunks/utils';

/**
 * Thunk to diff a resource against the configured cluster
 */

export const diffResource = createAsyncThunk<
  SetDiffDataPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/setDiffContent', async (diffResourceId, thunkAPI) => {
  const resourceMap = thunkAPI.getState().main.resourceMap;
  const kubeconfig = thunkAPI.getState().config.kubeconfig;
  try {
    const resource = resourceMap[diffResourceId];
    if (resource && resource.text) {
      const kc = new k8s.KubeConfig();
      kc.loadFromFile(kubeconfig);

      const handleResource = (res: any) => {
        if (res.body) {
          delete res.body.metadata?.managedFields;
          return {diffContent: stringify(res.body, {sortMapEntries: true}), diffResourceId};
        }

        return createPreviewRejection(
          thunkAPI,
          'Diff Resources',
          `Failed to get ${resource.content.kind} from cluster`
        );
      };

      const handleRejection = (rej: any) => {
        let message = `${resource.content.kind} ${resource.content.metadata.name} not found in cluster`;
        let title = 'Diff failed';

        return createPreviewRejection(thunkAPI, title, message);
      };

      if (resource.kind === 'ConfigMap') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api
          .readNamespacedConfigMap(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true'
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'Service') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api
          .readNamespacedService(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true'
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'ServiceAccount') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api
          .readNamespacedServiceAccount(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true'
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'PersistentVolume') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api
          .readPersistentVolume(resource.content.metadata.name, resource.namespace ? resource.namespace : 'default')
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'PersistentVolumeClaim') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api
          .readNamespacedPersistentVolumeClaim(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true'
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'Pod') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api
          .readNamespacedPod(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true'
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'Endpoints') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api
          .readNamespacedEndpoints(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true'
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'Secret') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api
          .readNamespacedSecret(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true'
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'ReplicationController') {
        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreV1Api
          .readNamespacedReplicationController(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true'
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'DaemonSet') {
        const k8sAppV1Api = kc.makeApiClient(k8s.AppsV1Api);
        return k8sAppV1Api
          .readNamespacedDaemonSet(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true'
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'Deployment') {
        const k8sAppV1Api = kc.makeApiClient(k8s.AppsV1Api);
        return k8sAppV1Api
          .readNamespacedDeployment(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true'
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'StatefuleSet') {
        const k8sAppV1Api = kc.makeApiClient(k8s.AppsV1Api);
        return k8sAppV1Api
          .readNamespacedStatefulSet(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true'
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'ReplicaSet') {
        const k8sAppV1Api = kc.makeApiClient(k8s.AppsV1Api);
        return k8sAppV1Api
          .readNamespacedReplicaSet(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true'
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'Job') {
        const k8sBatchV1Api = kc.makeApiClient(k8s.BatchV1Api);
        return k8sBatchV1Api
          .readNamespacedJob(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true'
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'CronJob') {
        const k8sBatchV1Api = kc.makeApiClient(k8s.BatchV1Api);
        return k8sBatchV1Api
          .readNamespacedCronJob(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default',
            'true'
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'ClusterRole') {
        const k8sRbacV1Api = kc.makeApiClient(k8s.RbacAuthorizationV1Api);
        return k8sRbacV1Api
          .readClusterRole(resource.content.metadata.name, resource.namespace ? resource.namespace : 'default')
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'ClusterRoleBinding') {
        const k8sRbacV1Api = kc.makeApiClient(k8s.RbacAuthorizationV1Api);
        return k8sRbacV1Api
          .readClusterRoleBinding(resource.content.metadata.name, resource.namespace ? resource.namespace : 'default')
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'Role') {
        const k8sRbacV1Api = kc.makeApiClient(k8s.RbacAuthorizationV1Api);
        return k8sRbacV1Api
          .readNamespacedRole(resource.content.metadata.name, resource.namespace ? resource.namespace : 'default')
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'RoleBinding') {
        const k8sRbacV1Api = kc.makeApiClient(k8s.RbacAuthorizationV1Api);
        return k8sRbacV1Api
          .readNamespacedRoleBinding(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default'
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'Ingress') {
        const k8sNetworkingV1Api = kc.makeApiClient(k8s.NetworkingV1Api);
        return k8sNetworkingV1Api
          .readNamespacedIngress(resource.content.metadata.name, resource.namespace ? resource.namespace : 'default')
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'NetworkPolicy') {
        const k8sNetworkingV1Api = kc.makeApiClient(k8s.NetworkingV1Api);
        return k8sNetworkingV1Api
          .readNamespacedNetworkPolicy(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default'
          )
          .then(handleResource, handleRejection);
      }
      if (resource.kind === 'CustomResourceDefinition') {
        const k8sExtensionV1Api = kc.makeApiClient(k8s.ApiextensionsV1Api);
        return k8sExtensionV1Api
          .readCustomResourceDefinition(
            resource.content.metadata.name,
            resource.namespace ? resource.namespace : 'default'
          )
          .then(handleResource, handleRejection);
      }
    }
  } catch (e) {
    createPreviewRejection(thunkAPI, 'Diff Resource', `Failed to diff resources; ${e.message}`);
    log.error(e);
  }

  return {};
});
