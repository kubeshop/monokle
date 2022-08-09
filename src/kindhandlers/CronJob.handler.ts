import * as k8s from '@kubernetes/client-node';

import log from 'loglevel';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {clusterResourceWatcher} from '.';
import {PodOutgoingRefMappers} from './common/outgoingRefMappers';

const CronJobHandler: ResourceKindHandler = {
  kind: 'CronJob',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.WORKLOADS, 'CronJobs'],
  clusterApiVersion: 'batch/v1',
  validationSchemaPrefix: 'io.k8s.api.batch.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
    const k8sBatchV1Api = kubeconfig.makeApiClient(k8s.BatchV1Api);
    return k8sBatchV1Api.readNamespacedCronJob(resource.name, resource.namespace || 'default', 'true');
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const k8sBatchV1Api = kubeconfig.makeApiClient(k8s.BatchV1Api);
    const response = namespace
      ? await k8sBatchV1Api.listNamespacedCronJob(namespace)
      : await k8sBatchV1Api.listCronJobForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
    const k8sBatchV1Api = kubeconfig.makeApiClient(k8s.BatchV1Api);
    await k8sBatchV1Api.deleteNamespacedCronJob(resource.name, resource.namespace || 'default');
  },
  outgoingRefMappers: [...PodOutgoingRefMappers],
  helpLink: 'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/',
  watcherReq: undefined,
  disconnectFromCluster() {
    try {
      CronJobHandler.watcherReq.abort();
      CronJobHandler.watcherReq = undefined;
    } catch (e: any) {
      CronJobHandler.watcherReq = undefined;
      log.log(e.message);
    }
  },
  async watchResources(...args) {
    const requestPath: string = args[2]?.namespace
      ? `/apis/batch/v1/namespaces/${args[2].namespace}/cronjobs`
      : `/apis/batch/v1/cronjobs`;
    clusterResourceWatcher(CronJobHandler, requestPath, args[0], args[1], args[2], args[3]);
    return CronJobHandler.listResourcesInCluster(args[1], args[2], args[3]);
  },
};

export default CronJobHandler;
