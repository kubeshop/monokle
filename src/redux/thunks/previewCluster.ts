import {createAsyncThunk} from '@reduxjs/toolkit';
import {SetPreviewDataPayload} from '@redux/reducers/main';
import {AppDispatch, RootState} from '@redux/store';
import {AppState} from '@models/appstate';
import * as k8s from '@kubernetes/client-node';
import {YAML_DOCUMENT_DELIMITER} from '@src/constants';
import {AlertEnum} from '@models/alert';
import {createPreviewRejection, createPreviewResult, getK8sObjectsAsYaml} from '@redux/thunks/utils';

/**
 * Thunk to preview cluster objects
 */

export const previewCluster = createAsyncThunk<
  SetPreviewDataPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/previewCluster', async (configPath, thunkAPI) => {
  const state: AppState = thunkAPI.getState().main;
  if (state.previewResource !== configPath) {
    try {
      const kc = new k8s.KubeConfig();
      kc.loadFromFile(configPath);
      const k8sAppV1Api = kc.makeApiClient(k8s.AppsV1Api);
      const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
      const k8sBatchV1Api = kc.makeApiClient(k8s.BatchV1Api);
      const k8sRbacV1Api = kc.makeApiClient(k8s.RbacAuthorizationV1Api);
      const k8sNetworkingV1Api = kc.makeApiClient(k8s.NetworkingV1Api);
      const k8sExtensionsV1Api = kc.makeApiClient(k8s.ApiextensionsV1Api);

      return Promise.allSettled([
        k8sAppV1Api.listDaemonSetForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'DaemonSet', 'apps/v1');
        }),
        k8sAppV1Api.listDeploymentForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'Deployment', 'apps/v1');
        }),
        k8sAppV1Api.listStatefulSetForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'StatefuleSet', 'apps/v1');
        }),
        k8sAppV1Api.listReplicaSetForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'ReplicaSet', 'apps/v1');
        }),
        k8sCoreV1Api.listConfigMapForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'ConfigMap', 'v1');
        }),
        k8sCoreV1Api.listServiceForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'Service', 'v1');
        }),
        k8sCoreV1Api.listServiceAccountForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'ServiceAccount', 'v1');
        }),
        k8sCoreV1Api.listPersistentVolume().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'PersistentVolume', 'v1');
        }),
        k8sCoreV1Api.listPersistentVolumeClaimForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'PersistentVolumeClaim', 'v1');
        }),
        k8sCoreV1Api.listPodForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'Pod', 'v1');
        }),
        k8sCoreV1Api.listEndpointsForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'Endpoints', 'v1');
        }),
        k8sCoreV1Api.listSecretForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'Secret', 'v1');
        }),
        k8sCoreV1Api.listReplicationControllerForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'ReplicationController', 'v1');
        }),
        k8sBatchV1Api.listJobForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'Job', 'batch/v1');
        }),
        k8sBatchV1Api.listCronJobForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'CronJob', 'batch/v1');
        }),
        k8sRbacV1Api.listClusterRole().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'ClusterRole', 'rbac.authorization.k8s.io/v1');
        }),
        k8sRbacV1Api.listClusterRoleBinding().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'ClusterRoleBinding', 'rbac.authorization.k8s.io/v1');
        }),
        k8sRbacV1Api.listRoleForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'Role', 'rbac.authorization.k8s.io/v1');
        }),
        k8sRbacV1Api.listRoleBindingForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'RoleBinding', 'rbac.authorization.k8s.io/v1');
        }),
        k8sNetworkingV1Api.listIngressForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'Ingress', 'networking.k8s.io/v1');
        }),
        k8sNetworkingV1Api.listNetworkPolicyForAllNamespaces().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'NetworkPolicy', 'networking.k8s.io/v1');
        }),
        k8sExtensionsV1Api.listCustomResourceDefinition().then(res => {
          return getK8sObjectsAsYaml(res.body.items, 'CustomResourceDefinition', 'apiextensions.k8s.io/v1');
        }),
      ]).then(
        results => {
          const fulfilledResults = results.filter(r => r.status === 'fulfilled' && r.value);

          if (fulfilledResults.length === 0) {
            return createPreviewRejection(
              thunkAPI,
              'Cluster Resources Failed',
              // @ts-ignore
              results[0].reason ? results[0].reason.toString() : JSON.stringify(results[0])
            );
          }

          // @ts-ignore
          const allYaml = fulfilledResults.map(r => r.value).join(YAML_DOCUMENT_DELIMITER);
          const previewResult = createPreviewResult(allYaml, configPath, 'Get Cluster Resources');

          if (fulfilledResults.length < results.length) {
            const rejectedResult = results.find(r => r.status === 'rejected');
            if (rejectedResult) {
              // @ts-ignore
              const reason = rejectedResult.reason ? rejectedResult.reason.toString() : JSON.stringify(rejectedResult);

              previewResult.alert = {
                title: 'Get Cluster Resources',
                message: `Failed to get all cluster resources: ${reason}`,
                type: AlertEnum.Warning,
              };

              return previewResult;
            }
          }

          return previewResult;
        },
        reason => {
          return createPreviewRejection(thunkAPI, 'Cluster Resources Failed', reason.message);
        }
      );
    } catch (e) {
      return createPreviewRejection(thunkAPI, 'Cluster Resources Failed', e.message);
    }
  }

  return {};
});
