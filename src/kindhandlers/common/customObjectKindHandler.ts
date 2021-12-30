import * as k8s from '@kubernetes/client-node';

import log from 'loglevel';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {RefMapper, ResourceKindHandler} from '@models/resourcekindhandler';

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

function extractFormSchema(editorSchema: any) {
  const schema: any = JSON.parse(JSON.stringify(editorSchema));
  if (schema && schema.properties) {
    // remove common object properties since these are shown in a separate form
    delete schema.properties['apiVersion'];
    delete schema.properties['kind'];
    delete schema.properties['metadata'];
  }

  return schema;
}

export const createNamespacedCustomObjectKindHandler = (
  kind: string,
  subsectionName: string,
  kindSectionName: string,
  kindGroup: string,
  kindVersion: string,
  kindPlural: string,
  editorSchema?: any,
  helpLink?: string,
  outgoingRefMappers?: RefMapper[]
): ResourceKindHandler => {
  return {
    kind,
    apiVersionMatcher: '**',
    navigatorPath: [navSectionNames.K8S_RESOURCES, subsectionName, kindSectionName],
    clusterApiVersion: `${kindGroup}/${kindVersion}`,
    isCustom: true,
    helpLink,
    outgoingRefMappers,
    sourceEditorOptions: editorSchema ? {editorSchema} : undefined,
    formEditorOptions: editorSchema ? {editorSchema: extractFormSchema(editorSchema)} : undefined,
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
    async listResourcesInCluster(kubeconfig: k8s.KubeConfig, crd?: K8sResource) {
      const customObjectsApi = kubeconfig.makeApiClient(k8s.CustomObjectsApi);

      if (crd) {
        const defaultVersion = findDefaultVersion(crd.content);
        if (defaultVersion) {
          return customObjectsApi.listClusterCustomObject(kindGroup, defaultVersion || kindVersion, kindPlural);
        }
      }

      // need to find which versions that are in cluster to find default version
      const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.ApiextensionsV1Api);
      const crdName = `${kindPlural}.${kindGroup}`;
      try {
        const result = await k8sCoreV1Api.readCustomResourceDefinition(crdName).then(
          response => {
            const defaultVersion = findDefaultVersion(response.body);
            // use listClusterCustomObject to get objects in all namespaces
            return customObjectsApi.listClusterCustomObject(kindGroup, defaultVersion || kindVersion, kindPlural);
          },
          () => {
            log.warn(`Failed to get CRD for ${crdName}, ignoring`);
            return [];
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

export const createClusterCustomObjectKindHandler = (
  kind: string,
  subsectionName: string,
  kindSectionName: string,
  kindGroup: string,
  kindVersion: string,
  kindPlural: string,
  editorSchema?: any,
  helpLink?: string,
  outgoingRefMappers?: RefMapper[]
): ResourceKindHandler => {
  return {
    kind,
    apiVersionMatcher: '**',
    navigatorPath: [navSectionNames.K8S_RESOURCES, subsectionName, kindSectionName],
    clusterApiVersion: `${kindGroup}/${kindVersion}`,
    helpLink,
    outgoingRefMappers,
    isCustom: true,
    sourceEditorOptions: editorSchema ? {editorSchema} : undefined,
    formEditorOptions: editorSchema ? {editorSchema: extractFormSchema(editorSchema)} : undefined,
    getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
      const {version, group} = extractResourceVersion(resource, kindVersion, kindGroup);

      const customObjectsApi = kubeconfig.makeApiClient(k8s.CustomObjectsApi);
      return customObjectsApi.getClusterCustomObject(group, version, kindPlural, resource.name);
    },
    async listResourcesInCluster(kubeconfig: k8s.KubeConfig, crd?: K8sResource) {
      const customObjectsApi = kubeconfig.makeApiClient(k8s.CustomObjectsApi);

      if (crd) {
        const defaultVersion = findDefaultVersion(crd.content);
        if (defaultVersion) {
          return customObjectsApi.listClusterCustomObject(kindGroup, defaultVersion || kindVersion, kindPlural);
        }
      }
      // need to find which versions that are in cluster to find default version
      const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.ApiextensionsV1Api);
      const crdName = `${kindPlural}.${kindGroup}`;
      try {
        const result = await k8sCoreV1Api.readCustomResourceDefinition(crdName).then(
          response => {
            const defaultVersion = findDefaultVersion(response.body);
            return customObjectsApi.listClusterCustomObject(kindGroup, defaultVersion || kindVersion, kindPlural);
          },
          () => {
            log.warn(`Failed to get CRD for ${crdName}, ignoring`);
            return [];
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
      await customObjectsApi.deleteClusterCustomObject(group, version, kindPlural, resource.name);
    },
  };
};
