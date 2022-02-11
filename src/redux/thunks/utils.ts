import * as k8s from '@kubernetes/client-node';

import {stringify} from 'yaml';

import {PREVIEW_PREFIX, YAML_DOCUMENT_DELIMITER_NEW_LINE} from '@constants/constants';

import {AlertEnum} from '@models/alert';
import {ResourceMapType, ResourceRefsProcessingOptions} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';

import {extractK8sResources, processParsedResources} from '@redux/services/resource';

import {createKubeClient} from '@utils/kubeclient';

import {getResourceKindHandler} from '@src/kindhandlers';

/**
 * Utility to convert list of objects returned by k8s api to a single YAML document
 */

export function getK8sObjectsAsYaml(items: any[], kind?: string, apiVersion?: string): string {
  return items
    .map(item => {
      delete item.metadata?.managedFields;

      if (kind && apiVersion && !item.apiVersion && !item.kind) {
        return `apiVersion: ${apiVersion}\nkind: ${kind}\n${stringify(item)}`;
      }

      return stringify(item);
    })
    .join(YAML_DOCUMENT_DELIMITER_NEW_LINE);
}

/**
 * Creates a preview result from a YAML string containing resources
 */

export function createPreviewResult(
  resourcesYaml: string,
  previewResourceId: string,
  title: string,
  resourceRefsProcessingOptions: ResourceRefsProcessingOptions,
  previewKubeConfigPath?: string,
  previewKubeConfigContext?: string
) {
  const resources = extractK8sResources(resourcesYaml, PREVIEW_PREFIX + previewResourceId);
  const resourceMap = resources.reduce((rm: ResourceMapType, r) => {
    rm[r.id] = r;
    return rm;
  }, {});

  processParsedResources(resourceMap, resourceRefsProcessingOptions);
  return {
    previewResourceId,
    previewResources: resourceMap,
    alert: {
      title,
      message: `Previewing ${Object.keys(resourceMap).length} resources`,
      type: AlertEnum.Success,
    },
    previewKubeConfigPath,
    previewKubeConfigContext,
  };
}

/**
 * Creates a thunk rejection that displays an error alert
 */

export function createRejectionWithAlert(thunkAPI: any, title: string, message: string) {
  return thunkAPI.rejectWithValue({
    alert: {
      title,
      message,
      type: AlertEnum.Error,
    },
  });
}

export async function getResourceFromCluster(resource: K8sResource, kubeconfigPath: string, context?: string) {
  const resourceKindHandler = getResourceKindHandler(resource.kind);

  if (resource && resource.text && resourceKindHandler) {
    const kubeClient = createKubeClient(kubeconfigPath, context);
    const resourceFromCluster = await resourceKindHandler.getResourceFromCluster(kubeClient, resource);
    return resourceFromCluster;
  }
}

export async function removeNamespaceFromCluster(namespace: string, kubeconfigPath: string, context?: string) {
  const kubeClient = createKubeClient(kubeconfigPath, context);
  const k8sCoreV1Api = kubeClient.makeApiClient(k8s.CoreV1Api);
  await k8sCoreV1Api.deleteNamespace(namespace);
}
