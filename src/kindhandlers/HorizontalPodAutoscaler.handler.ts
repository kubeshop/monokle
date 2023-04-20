import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const HorizontalPodAutoscalerHandler: ResourceKindHandler = {
  kind: 'HorizontalPodAutoscaler',
  apiVersionMatcher: '**',
  isNamespaced: true,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.CONFIGURATION, 'HPAs'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.autoscaling.v1',
  isCustom: false,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta): Promise<any> {
    const autoscalingV1Api = kubeconfig.makeApiClient(k8s.AutoscalingV1Api);
    autoscalingV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    return autoscalingV1Api.readNamespacedHorizontalPodAutoscaler(
      resource.name,
      resource.namespace || 'default',
      'true'
    );
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig, {namespace}) {
    const autoscalingV1Api = kubeconfig.makeApiClient(k8s.AutoscalingV1Api);
    autoscalingV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    const response = namespace
      ? await autoscalingV1Api.listNamespacedHorizontalPodAutoscaler(namespace)
      : await autoscalingV1Api.listHorizontalPodAutoscalerForAllNamespaces();
    return response.body.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta) {
    const autoscalingV1Api = kubeconfig.makeApiClient(k8s.AutoscalingV1Api);
    autoscalingV1Api.setDefaultAuthentication(new k8s.VoidAuth());
    await autoscalingV1Api.deleteNamespacedHorizontalPodAutoscaler(resource.name, resource.namespace || 'default');
  },
  helpLink: 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/',
};

export default HorizontalPodAutoscalerHandler;
