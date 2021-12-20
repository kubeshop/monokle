import * as k8s from '@kubernetes/client-node';

import log from 'loglevel';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {loadCustomSchema} from '@redux/services/schema';
import {findDefaultVersion} from '@redux/thunks/previewCluster';

/**
 * extract the version from the apiVersion string of the specified resource
 */

function extractResourceVersion(resource: K8sResource, kindVersion: string, kindGroup: string) {
  const ix = resource.version.lastIndexOf('/');
  const version = ix > 0 ? resource.version.substring(ix + 1) : kindVersion;
  const group = ix > 0 ? resource.version.substring(0, ix) : kindGroup;
  return {version, group};
}

export const createCustomObjectKindHandler = (
  kind: string,
  subsectionName: string,
  kindSectionName: string,
  kindGroup: string,
  kindVersion: string,
  kindPlural: string,
  pathToSchemaResource?: string
): ResourceKindHandler => {
  return {
    kind,
    apiVersionMatcher: '**',
    navigatorPath: [navSectionNames.K8S_RESOURCES, subsectionName, kindSectionName],
    clusterApiVersion: `${kindGroup}/${kindVersion}`,
    sourceEditorOptions: pathToSchemaResource
      ? {
          editorSchema: loadCustomSchema(pathToSchemaResource, kind),
        }
      : undefined,
    getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
      const {version, group} = extractResourceVersion(resource, kindVersion, kindGroup);

      const customObjectsApi = kubeconfig.makeApiClient(k8s.CustomObjectsApi);
      return customObjectsApi.getNamespacedCustomObject(
        group,
        version,
        resource.namespace || 'default',
        kindPlural,
        resource.name
      );
    },
    async listResourcesInCluster(kubeconfig: k8s.KubeConfig) {
      // need to find which versions that are in cluster to find default version
      const customObjectsApi = kubeconfig.makeApiClient(k8s.CustomObjectsApi);
      const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.ApiextensionsV1Api);
      const crdName = `${kindPlural}.${kindGroup}`;
      try {
        const result = await k8sCoreV1Api.readCustomResourceDefinition(crdName).then(
          response => {
            const defaultVersion = findDefaultVersion(response.body);
            return customObjectsApi.listClusterCustomObject(kindGroup, defaultVersion || kindVersion, kindPlural);
          },
          reason => {
            log.warn(`Failed to get CRD for ${crdName}, using version ${kindVersion}`, reason);
            return customObjectsApi.listClusterCustomObject(kindGroup, kindVersion, kindPlural);
          }
        );

        // @ts-ignore
        return result.body?.items || [];
      } catch (e) {
        log.warn(`error retrieving ${kindSectionName}`, e);
        return [];
      }
    },
    async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
      const {version, group} = extractResourceVersion(resource, kindVersion, kindGroup);

      const customObjectsApi = kubeconfig.makeApiClient(k8s.CustomObjectsApi);
      await customObjectsApi.deleteNamespacedCustomObject(
        group,
        version,
        resource.namespace || 'default',
        kindPlural,
        resource.name
      );
    },
  };
};
