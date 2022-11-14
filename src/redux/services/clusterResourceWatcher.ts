/* eslint-disable no-constructor-return */
import * as k8s from '@kubernetes/client-node';

import {PREVIEW_PREFIX} from '@constants/constants';

import {ResourceMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {deleteClusterResource, updateClusterResource} from '@redux/reducers/main';

import {jsonToYaml} from '@utils/yaml';

import {getRegisteredKindHandlers} from '@src/kindhandlers';

import {extractK8sResources} from './resource';

export const resourceKindRequestURLs: {[resourceKind: string]: string} = {
  ClusterRole: `/apis/rbac.authorization.k8s.io/v1/clusterroles`,
  ClusterRoleBinding: `/apis/rbac.authorization.k8s.io/v1/clusterrolebindings`,
  ConfigMap: `/api/v1/configmaps`,
  CronJob: `/apis/batch/v1/cronjobs`,
  CustomResourceDefinition: `/apis/apiextensions.k8s.io/v1/customresourcedefinitions`,
  DaemonSet: `/apis/apps/v1/daemonsets`,
  Deployment: `/apis/apps/v1/deployments`,
  EndpointSlice: `/apis/discovery.k8s.io/v1/endpointslices`,
  Endpoints: `/api/v1/endpoints`,
  HorizontalPodAutoscaler: `/apis/autoscaling/v1/horizontalpodautoscalers`,
  Ingress: `/apis/networking.k8s.io/v1/ingresses`,
  Job: `/apis/batch/v1/jobs`,
  LimitRange: `/api/v1/limitranges`,
  Namespace: `/api/v1/namespaces`,
  NetworkPolicy: `/apis/networking.k8s.io/v1/networkpolicies`,
  PersistentVolume: `/api/v1/persistentvolumes`,
  PersistentVolumeClaim: `/api/v1/persistentvolumeclaims`,
  Pod: `/api/v1/pods`,
  ReplicaSet: `/apis/apps/v1/replicasets`,
  ReplicationController: `/api/v1/replicationcontrollers`,
  ResourceQuota: `/api/v1/resourcequotas`,
  Role: `/apis/rbac.authorization.k8s.io/v1/roles`,
  RoleBinding: `/apis/rbac.authorization.k8s.io/v1/rolebindings`,
  Secret: `/api/v1/secrets`,
  Service: `/api/v1/services`,
  ServiceAccount: `/api/v1/serviceaccounts`,
  StatefulSet: `/apis/apps/v1/statefulsets`,
  StorageClass: `/apis/storage.k8s.io/v1/storageclasses`,
  VolumeAttachment: `/apis/storage.k8s.io/v1/volumeattachments`,
};

const watchers: {[resourceKind: string]: any} = {};

export const disconnectResourceFromCluster = (kindHandler: ResourceKindHandler) => {
  try {
    watchers[kindHandler.kind].abort();
    watchers[kindHandler.kind] = undefined;
  } catch (error) {
    watchers[kindHandler.kind] = undefined;
  }
};

export const disconnectFromCluster = () => {
  Object.values(watchers).forEach(req => req.abort());
};

export const watchResource = async (
  dispatch: any,
  kindHandler: ResourceKindHandler,
  kubeConfig: k8s.KubeConfig,
  previewResources: ResourceMapType
) => {
  disconnectResourceFromCluster(kindHandler);
  watchers[kindHandler.kind] = await new k8s.Watch(kubeConfig).watch(
    resourceKindRequestURLs[kindHandler.kind],
    {allowWatchBookmarks: false},
    (type: string, apiObj: any) => {
      if (type === 'ADDED') {
        const [resource]: K8sResource[] = extractK8sResources(
          jsonToYaml(apiObj),
          PREVIEW_PREFIX + kubeConfig.currentContext
        );
        if (!previewResources[resource.id]) {
          dispatch(updateClusterResource(resource));
        }
      }

      if (type === 'MODIFIED') {
        const [resource]: K8sResource[] = extractK8sResources(
          jsonToYaml(apiObj),
          PREVIEW_PREFIX + kubeConfig.currentContext
        );

        dispatch(updateClusterResource(resource));
      }
      if (type === 'DELETED') {
        const [resource]: K8sResource[] = extractK8sResources(
          jsonToYaml(apiObj),
          PREVIEW_PREFIX + kubeConfig.currentContext
        );
        dispatch(deleteClusterResource(resource));
      }
    },
    (error: any) => {
      if (resourceKindRequestURLs[kindHandler.kind] && error.message !== 'aborted') {
        disconnectResourceFromCluster(kindHandler);
        watchResource(dispatch, kindHandler, kubeConfig, previewResources);
      }
    }
  );
};

export const startWatchingResources = (
  dispatch: any,
  kubeConfig: k8s.KubeConfig,
  previewResources: ResourceMapType
) => {
  getRegisteredKindHandlers().map((handler: ResourceKindHandler) =>
    watchResource(dispatch, handler, kubeConfig, previewResources)
  );
};
