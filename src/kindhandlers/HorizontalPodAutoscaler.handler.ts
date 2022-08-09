import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {clusterResourceWatcher} from '.';

const HorizontalPodAutoscalerHandler: ResourceKindHandler = {
  kind: 'HorizontalPodAutoscaler',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.CONFIGURATION, 'HPAs'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.autoscaling.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
    const autoscalingV1Api = kubeconfig.makeApiClient(k8s.AutoscalingV1Api);
    return autoscalingV1Api.readNamespacedHorizontalPodAutoscaler(
      resource.name,
      resource.namespace || 'default',
      'true'
    );
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const autoscalingV1Api = kubeconfig.makeApiClient(k8s.AutoscalingV1Api);
    const response = namespace
      ? await autoscalingV1Api.listNamespacedHorizontalPodAutoscaler(namespace)
      : await autoscalingV1Api.listHorizontalPodAutoscalerForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
    const autoscalingV1Api = kubeconfig.makeApiClient(k8s.AutoscalingV1Api);
    await autoscalingV1Api.deleteNamespacedHorizontalPodAutoscaler(resource.name, resource.namespace || 'default');
  },
  helpLink: 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/',
  watcherReq: undefined,
  disconnectFromCluster() {
    try {
      HorizontalPodAutoscalerHandler.watcherReq.abort();
      HorizontalPodAutoscalerHandler.watcherReq = undefined;
    } catch (e: any) {
      HorizontalPodAutoscalerHandler.watcherReq = undefined;
    }
  },
  async watchResources(...args) {
    const requestPath: string = args[2]?.namespace
      ? `/apis/autoscaling/v1/namespaces/${args[2].namespace}/horizontalpodautoscalers`
      : `/apis/autoscaling/v1/horizontalpodautoscalers`;
    clusterResourceWatcher(HorizontalPodAutoscalerHandler, requestPath, args[0], args[1], args[2], args[3]);
    return HorizontalPodAutoscalerHandler.listResourcesInCluster(args[1], args[2], args[3]);
  },
};

export default HorizontalPodAutoscalerHandler;
