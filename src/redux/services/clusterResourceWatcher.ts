/* eslint-disable no-constructor-return */
import * as k8s from '@kubernetes/client-node';

import log from 'loglevel';

import {PREVIEW_PREFIX} from '@constants/constants';

import {
  deleteMultipleClusterResources,
  setIsClusterConnected,
  updateMultipleClusterResources,
} from '@redux/reducers/main';

import {jsonToYaml} from '@utils/yaml';

import {getRegisteredKindHandlers, registerCrdKindHandlers} from '@src/kindhandlers';
import CustomResourceDefinitionHandler from '@src/kindhandlers/CustomResourceDefinition.handler';
import {extractKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';

import {ResourceMapType} from '@shared/models/appState';
import {K8sResource} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

import {extractK8sResources} from './resource';

let isClusterConnected: boolean = false;
let intervalId: string | number | NodeJS.Timeout;
const intervalPeriod = 10000;
let resourcesToUpdate: K8sResource[] = [];
let resourcesToDelete: K8sResource[] = [];

export const resourceKindRequestURLs: {[resourceKind: string]: string} = {
  CustomResourceDefinition: `/apis/apiextensions.k8s.io/v1/customresourcedefinitions`,
  ClusterRole: `/apis/rbac.authorization.k8s.io/v1/clusterroles`,
  ClusterRoleBinding: `/apis/rbac.authorization.k8s.io/v1/clusterrolebindings`,
  ConfigMap: `/api/v1/configmaps`,
  CronJob: `/apis/batch/v1/cronjobs`,
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
  Node: '/api/v1/nodes',
  Event: '/apis/events.k8s.io/v1/events',
};

export enum ClusterConnectionStatus {
  REFUSED = -2,
  ABORTED = -1,
  IDLE = 0,
  CONNECTED = 1,
}

const crdRequestURLGenerator = (clusterApiVersion: string, plural: string) => {
  return `/apis/${clusterApiVersion}/${plural}`;
};

const watchers: {[resourceKind: string]: {watcher: any; status: ClusterConnectionStatus}} = {};

const disconnectResourceFromCluster = (kindHandler: ResourceKindHandler) => {
  if (watchers[`${kindHandler.clusterApiVersion}-${kindHandler.kind}`]) {
    try {
      watchers[`${kindHandler.clusterApiVersion}-${kindHandler.kind}`].watcher.abort();
      watchers[`${kindHandler.clusterApiVersion}-${kindHandler.kind}`].watcher = undefined;
    } catch (error) {
      watchers[`${kindHandler.clusterApiVersion}-${kindHandler.kind}`].watcher = undefined;
    }
  }
};

const watchResource = async (
  dispatch: any,
  kindHandler: ResourceKindHandler,
  kubeConfig: k8s.KubeConfig,
  previewResources: ResourceMapType,
  plural?: string
) => {
  if (
    watchers[`${kindHandler.clusterApiVersion}-${kindHandler.kind}`] &&
    watchers[`${kindHandler.clusterApiVersion}-${kindHandler.kind}`].status === ClusterConnectionStatus.CONNECTED
  ) {
    disconnectResourceFromCluster(kindHandler);
  }
  watchers[`${kindHandler.clusterApiVersion}-${kindHandler.kind}`] = {
    status: ClusterConnectionStatus.IDLE,
    watcher: undefined,
  };
  watchers[`${kindHandler.clusterApiVersion}-${kindHandler.kind}`].watcher = await new k8s.Watch(kubeConfig).watch(
    kindHandler.isCustom
      ? crdRequestURLGenerator(kindHandler.clusterApiVersion, plural || kindHandler.kind)
      : resourceKindRequestURLs[kindHandler.kind],
    {allowWatchBookmarks: false},
    async (type: string, apiObj: any) => {
      watchers[`${kindHandler.clusterApiVersion}-${kindHandler.kind}`].status = ClusterConnectionStatus.CONNECTED;
      const resource: K8sResource = processResource(apiObj, kubeConfig);

      if (type === 'ADDED' && !previewResources[resource.id]) {
        if (kindHandler.kind === CustomResourceDefinitionHandler.kind) {
          registerCrdKindHandlers(JSON.stringify(apiObj));
          const handler = extractKindHandler(apiObj);
          if (handler) {
            await watchResource(dispatch, handler, kubeConfig, previewResources, handler.kindPlural);
          }
        }
        resourcesToUpdate.push(resource);
        // dispatch(updateClusterResource(resource));
        return;
      }
      if (type === 'MODIFIED') {
        resourcesToUpdate.push(resource);
        // dispatch(updateClusterResource(resource));
        return;
      }
      if (type === 'DELETED') {
        resourcesToDelete.push(resource);
        // dispatch(deleteClusterResource(resource));
      }
    },
    (error: any) => {
      log.warn(kindHandler.clusterApiVersion, kindHandler.kind, error.message);
      watchers[`${kindHandler.clusterApiVersion}-${kindHandler.kind}`].status = ClusterConnectionStatus.REFUSED;
      if (resourceKindRequestURLs[kindHandler.kind] && error.message !== 'aborted') {
        watchers[`${kindHandler.clusterApiVersion}-${kindHandler.kind}`].status = ClusterConnectionStatus.ABORTED;
        watchResource(dispatch, kindHandler, kubeConfig, previewResources);
      }
      if (isClusterConnected === isClusterDisconnected()) {
        isClusterConnected = !isClusterDisconnected();
        dispatch(setIsClusterConnected(!isClusterDisconnected()));
      }
    }
  );
};

export const processResource = (apiObj: any, kubeConfig: k8s.KubeConfig): K8sResource => {
  const [resource]: K8sResource[] = extractK8sResources(jsonToYaml(apiObj), PREVIEW_PREFIX + kubeConfig.currentContext);
  return resource;
};

export const startWatchingResources = (
  dispatch: any,
  kubeConfig: k8s.KubeConfig,
  previewResources: ResourceMapType,
  namespace: string
) => {
  getRegisteredKindHandlers().map((handler: ResourceKindHandler) =>
    watchResource(dispatch, handler, kubeConfig, previewResources, handler.kindPlural)
  );
  watchResource(dispatch, CustomResourceDefinitionHandler, kubeConfig, previewResources);
  intervalId = setInterval(() => {
    if (resourcesToUpdate.length > 0) {
      dispatch(
        updateMultipleClusterResources(
          resourcesToUpdate.filter(r => {
            if (namespace === '<all>') {
              return true;
            }
            if (namespace === '<not-namespaced>') {
              return !r.namespace;
            }
            return r.namespace === namespace;
          })
        )
      );
      resourcesToUpdate = [];
    }
    if (resourcesToDelete.length > 0) {
      dispatch(
        deleteMultipleClusterResources(
          resourcesToDelete.filter(r => {
            if (namespace === '<all>') {
              return true;
            }
            if (namespace === '<not-namespaced>') {
              return !r.namespace;
            }
            return r.namespace === namespace;
          })
        )
      );
      resourcesToDelete = [];
    }
  }, intervalPeriod);
};

export const disconnectFromCluster = () => {
  getRegisteredKindHandlers().map((handler: ResourceKindHandler) => disconnectResourceFromCluster(handler));
  if (intervalId) {
    clearInterval(intervalId);
  }
};

export const isClusterDisconnected = () => {
  return Object.values(watchers).reduce((output: boolean, watcher) => output && watcher.status < 0, true);
};
