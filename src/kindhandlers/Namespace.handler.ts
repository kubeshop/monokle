import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {useAppDispatch} from '@redux/hooks';
import {k8sApi} from '@redux/services/K8sApi';

import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

const NamespaceHandler: ResourceKindHandler = {
  kind: 'Namespace',
  apiVersionMatcher: '**',
  isNamespaced: false,
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.CONFIGURATION, 'Namespaces'],
  clusterApiVersion: 'v1',
  validationSchemaPrefix: 'io.k8s.api.core.v1',
  isCustom: false,
  async getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta): Promise<any> {
    // const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    // const json = await k8sCoreV1Api.readNamespace(resource.name, 'true');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const dispatch = useAppDispatch();
    const result = await dispatch(k8sApi.endpoints.getNamespace.initiate({namespace: resource.name})).unwrap();
    return result;
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    // const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    // const response = await k8sCoreV1Api.listNamespace();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const dispatch = useAppDispatch();
    const result = await dispatch(k8sApi.endpoints.getNamespaces.initiate({})).unwrap();

    return result.items;
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const dispatch = useAppDispatch();
    await dispatch(k8sApi.endpoints.deleteNamespace.initiate({namespace: resource.name})).unwrap();
  },
  helpLink: 'https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/',
};

export default NamespaceHandler;
