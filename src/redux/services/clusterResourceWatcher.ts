/* eslint-disable no-constructor-return */
import * as k8s from '@kubernetes/client-node';

import {PREVIEW_PREFIX} from '@constants/constants';

import {AppState} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {createKubeClient} from '@utils/kubeclient';
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

export class ResourceWatcher {
  private static instance: ResourceWatcher;
  public kubeConfig?: k8s.KubeConfig;
  private kubeConfigPath?: string;
  private kubeConfigContext?: string;
  private watchers: {[resourceKind: string]: any} = {};

  constructor() {
    if (ResourceWatcher.instance) {
      return ResourceWatcher.instance;
    }
    ResourceWatcher.instance = this;
  }

  initializeKubeConfig(kubeConfigPath?: string, context?: string) {
    try {
      this.kubeConfigPath = kubeConfigPath;
      this.kubeConfigContext = context;
      const kc = createKubeClient(this.kubeConfigPath as string, this.kubeConfigContext);
      this.kubeConfig = kc;
    } catch (error) {
      this.kubeConfigPath = undefined;
      this.kubeConfigContext = undefined;
      this.kubeConfig = undefined;
    }
  }

  setKubeConfigContext(context: string) {
    this.getKubeConfig().setCurrentContext(context);
  }

  getKubeConfig(): k8s.KubeConfig {
    return this.kubeConfig as k8s.KubeConfig;
  }

  setKubeConfig(kubeConfig: k8s.KubeConfig) {
    this.kubeConfig = kubeConfig;
  }

  disconnectResourceFromCluster(kindHandler: ResourceKindHandler) {
    try {
      this.watchers[kindHandler.kind].abort();
      this.watchers[kindHandler.kind] = undefined;
      delete this.watchers[kindHandler.kind];
    } catch (error) {
      this.watchers[kindHandler.kind] = undefined;
      delete this.watchers[kindHandler.kind];
    }
  }

  async watchResource(state: AppState, kindHandler: ResourceKindHandler) {
    this.disconnectResourceFromCluster(kindHandler);
    if (this.kubeConfig) {
      this.watchers[kindHandler.kind] = await new k8s.Watch(this.kubeConfig).watch(
        resourceKindRequestURLs[kindHandler.kind],
        {allowWatchBookmarks: false},
        (type: string, apiObj: any) => {
          console.log('apiObj', type, apiObj);

          if (type === 'ADDED' || type === 'MODIFIED') {
            const [resource]: K8sResource[] = extractK8sResources(
              jsonToYaml(apiObj),
              PREVIEW_PREFIX + this.kubeConfigContext
            );
            state.resourceMap[resource.id] = resource;
          }
          if (type === 'DELETED') {
            const [resource]: K8sResource[] = extractK8sResources(
              jsonToYaml(apiObj),
              PREVIEW_PREFIX + this.kubeConfigContext
            );
            delete state.resourceMap[resource.id];
          }
        },
        () => {
          this.disconnectResourceFromCluster(kindHandler);
          this.watchResource(state, kindHandler);
        }
      );
    }
  }

  startWatchingResources(state: AppState) {
    getRegisteredKindHandlers().map((handler: ResourceKindHandler) => this.watchResource(state, handler));
  }
}
