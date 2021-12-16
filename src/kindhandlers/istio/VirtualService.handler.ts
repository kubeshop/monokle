import * as k8s from '@kubernetes/client-node';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {findDefaultVersion} from '@redux/thunks/previewCluster';

const VIRTUAL_SERVICE_GROUP = 'networking.istio.io';
const VIRTUAL_SERVICE_PLURAL = 'virtualservices';
const VIRTUAL_SERVICE_VERSION = 'v1beta1';
const VirtualServiceHandler: ResourceKindHandler = {
  kind: 'VirtualService',
  apiVersionMatcher: '**',
  navigatorPath: [navSectionNames.K8S_RESOURCES, navSectionNames.NETWORK, 'VirtualServices'],
  clusterApiVersion: `${VIRTUAL_SERVICE_GROUP}/${VIRTUAL_SERVICE_VERSION}`,
  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
    const ix = resource.version.lastIndexOf('/');
    const version = ix > 0 ? resource.version.substring(ix + 1) : VIRTUAL_SERVICE_VERSION;
    const group = ix > 0 ? resource.version.substring(0, ix) : VIRTUAL_SERVICE_GROUP;

    const customObjectsApi = kubeconfig.makeApiClient(k8s.CustomObjectsApi);
    return customObjectsApi.getNamespacedCustomObject(
      group,
      version,
      resource.namespace || 'default',
      VIRTUAL_SERVICE_PLURAL,
      resource.name
    );
  },
  async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
    // need to find which versions that are in cluster to find default version
    const customObjectsApi = kubeconfig.makeApiClient(k8s.CustomObjectsApi);
    const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.ApiextensionsV1Api);
    const crdName = `${VIRTUAL_SERVICE_PLURAL}.${VIRTUAL_SERVICE_GROUP}`;
    try {
      const result = await k8sCoreV1Api.readCustomResourceDefinition(crdName).then(
        response => {
          const defaultVersion = findDefaultVersion(response.body);
          return customObjectsApi.listClusterCustomObject(
            VIRTUAL_SERVICE_GROUP,
            defaultVersion || VIRTUAL_SERVICE_VERSION,
            VIRTUAL_SERVICE_PLURAL
          );
        },
        reason => {
          console.log(`Failed to get CRD for ${crdName}, using version ${VIRTUAL_SERVICE_VERSION}`, reason);
          return customObjectsApi.listClusterCustomObject(
            VIRTUAL_SERVICE_GROUP,
            VIRTUAL_SERVICE_VERSION,
            VIRTUAL_SERVICE_PLURAL
          );
        }
      );

      // @ts-ignore
      return result.body?.items || [];
    } catch (e) {
      console.log('error retrieving VirtualServices', e);
      return [];
    }
  },
  async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
    const ix = resource.version.lastIndexOf('/');
    const version = ix > 0 ? resource.version.substring(ix + 1) : VIRTUAL_SERVICE_VERSION;
    const group = ix > 0 ? resource.version.substring(0, ix) : VIRTUAL_SERVICE_GROUP;

    const customObjectsApi = kubeconfig.makeApiClient(k8s.CustomObjectsApi);
    await customObjectsApi.deleteNamespacedCustomObject(
      group,
      version,
      resource.namespace || 'default',
      VIRTUAL_SERVICE_PLURAL,
      resource.name
    );
  },
};

export default VirtualServiceHandler;
