import * as k8s from '@kubernetes/client-node';

import log from 'loglevel';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const NodeHandler: ResourceKindHandler = {
  kind: 'Node',
  apiVersionMatcher: '**',
  isNamespaced: false,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.CONFIGURATION, 'Nodes'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.core.v1',
  isCustom: false,
  async getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    const response = await k8sCoreV1Api.listNode();
    const nodes: k8s.V1Node[] = response.body.items;
    return nodes.find(node => node.metadata?.name === resource.name);
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    const response = await k8sCoreV1Api.listNode();
    return response.body.items;
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteResourceInCluster(_kubeconfig: k8s.KubeConfig, _resource: K8sResource) {
    log.warn(`${NodeHandler.kind} delete is not implemented!`);
  },
  helpLink: 'https://kubernetes.io/docs/concepts/architecture/nodes/',
};

export default NodeHandler;
