import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';

const CustomResourceDefinitionHandler: ResourceKindHandler = {
  kind: 'CustomResourceDefinition',
  apiVersionMatcher: '*',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.ApiextensionsV1Api);
    return k8sCoreV1Api.readCustomResourceDefinition(name);
  },
  listResourcesInCluster(kubeconfig: k8s.KubeConfig): Promise<any[]> {
    return Promise.resolve([]);
  },
};

export default CustomResourceDefinitionHandler;
