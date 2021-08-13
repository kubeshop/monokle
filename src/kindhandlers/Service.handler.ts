import * as k8s from '@kubernetes/client-node';
import {ResourceKindHandler} from '@models/resourcekindhandler';

const ServiceHandler: ResourceKindHandler = {
  kind: 'Service',
  apiVersionMatcher: '*',
  description: '',
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string, namespace: string): Promise<any> {
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.CoreV1Api);
    return k8sCoreV1Api.readNamespacedService(name, namespace, 'true');
  },
  listResourcesInCluster(kubeconfig: k8s.KubeConfig): Promise<any[]> {
    return Promise.resolve([]);
  },
};

export default ServiceHandler;
