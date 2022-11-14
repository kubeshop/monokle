import * as k8s from '@kubernetes/client-node';

import {K8sResource} from '@models/k8sresource';
import {ClusterResourceOptions, ResourceKindHandler} from '@models/resourcekindhandler';

import {deleteClusterResource, updateClusterResource} from '@redux/reducers/main';

import electronStore from '@utils/electronStore';

import {getRegisteredKindHandlers} from '@src/kindhandlers';

const watchers: {[resourceKind: string]: any} = {};

export const startWatching = () => {
  getRegisteredKindHandlers().forEach((handler: ResourceKindHandler) => {});
};

export async function clusterResourceWatcher(
  kindHandler: ResourceKindHandler,
  requestPath: string,
  dispatch: any,
  kubeconfig: k8s.KubeConfig,
  options: ClusterResourceOptions,
  crds?: K8sResource
) {
  disconnectFromCluster(kindHandler);
  watchers[kindHandler.kind] = await new k8s.Watch(kubeconfig).watch(
    requestPath,
    {allowWatchBookmarks: false},
    (type: string, apiObj: any) => {
      const isPreviewLoaderLoading = Boolean(electronStore.get('main.previewLoader.isLoading'));

      if (!isPreviewLoaderLoading && (type === 'ADDED' || type === 'MODIFIED')) {
        dispatch(updateClusterResource(apiObj));
      }
      if (!isPreviewLoaderLoading && type === 'DELETED') {
        dispatch(deleteClusterResource(apiObj));
      }
    },
    () => {
      disconnectFromCluster(kindHandler);
      kindHandler.watchResources && kindHandler.watchResources(dispatch, kubeconfig, options, crds);
      clusterResourceWatcher(kindHandler, requestPath, dispatch, kubeconfig, options, crds);
    }
  );
}

export const disconnectFromCluster = (kindHandler: ResourceKindHandler) => {
  try {
    watchers[kindHandler.kind].abort();
    delete watchers[kindHandler.kind];
  } catch (error) {
    delete watchers[kindHandler.kind];
  }
};

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
