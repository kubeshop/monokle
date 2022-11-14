import * as k8s from '@kubernetes/client-node';

import {PREVIEW_PREFIX} from '@constants/constants';

import {AppState} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {jsonToYaml} from '@utils/yaml';

import {getRegisteredKindHandlers} from '@src/kindhandlers';

import {extractK8sResources} from './resource';

const watchers: {[resourceKind: string]: any} = {};

export const startWatchingResources = (state: AppState) => {
  const kc = new k8s.KubeConfig();
  kc.loadFromFile(state.previewKubeConfigPath as string);
  kc.setCurrentContext(state.previewKubeConfigContext as string);
  getRegisteredKindHandlers().map((handler: ResourceKindHandler) => clusterResourceWatcher(state, handler, kc));
};

export async function clusterResourceWatcher(
  state: AppState,
  kindHandler: ResourceKindHandler,
  kubeconfig: k8s.KubeConfig
) {
  disconnectFromCluster(kindHandler);
  watchers[kindHandler.kind] = await new k8s.Watch(kubeconfig).watch(
    resourceKindRequestURLs[kindHandler.kind],
    {allowWatchBookmarks: false},
    (type: string, apiObj: any) => {
      if (type === 'MODIFIED' || type === 'DELETED') {
        console.log('apiObj', apiObj);
      }

      if (type === 'ADDED' || type === 'MODIFIED') {
        const [resource]: K8sResource[] = extractK8sResources(
          jsonToYaml(apiObj),
          PREVIEW_PREFIX + kubeconfig.getCurrentContext()
        );
        state.resourceMap[resource.id] = resource;
      }
      if (type === 'DELETED') {
        const [resource]: K8sResource[] = extractK8sResources(
          jsonToYaml(apiObj),
          PREVIEW_PREFIX + kubeconfig.getCurrentContext()
        );
        delete state.resourceMap[resource.id];
      }
    },
    () => {
      disconnectFromCluster(kindHandler);
      clusterResourceWatcher(state, kindHandler, kubeconfig);
    }
  );
}

export const disconnectFromCluster = (kindHandler: ResourceKindHandler) => {
  try {
    watchers[kindHandler.kind].abort();
    watchers[kindHandler.kind] = undefined;
    delete watchers[kindHandler.kind];
  } catch (error) {
    watchers[kindHandler.kind] = undefined;
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
