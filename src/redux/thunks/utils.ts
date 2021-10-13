import * as k8s from '@kubernetes/client-node';
import {PREVIEW_PREFIX, YAML_DOCUMENT_DELIMITER_NEW_LINE} from '@constants/constants';
import {ResourceMapType, ResourceRefsProcessingOptions} from '@models/appstate';
import {extractK8sResources, processParsedResources} from '@redux/services/resource';
import {stringify} from 'yaml';
import {AlertEnum} from '@models/alert';
import {K8sResource} from '@models/k8sresource';
import {getResourceKindHandler} from '@src/kindhandlers';

/**
 * Utility to convert list of objects returned by k8s api to a single YAML document
 */

export function getK8sObjectsAsYaml(items: any[], kind: string, apiVersion: string) {
  return items
    .map(item => {
      delete item.metadata?.managedFields;
      return `apiVersion: ${apiVersion}\nkind: ${kind}\n${stringify(item)}`;
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
  resourceRefsProcessingOptions: ResourceRefsProcessingOptions
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
  };
}

/**
 * Creates a preview rejection that displays an error alert
 */

export function createPreviewRejection(thunkAPI: any, title: string, message: string) {
  return thunkAPI.rejectWithValue({
    alert: {
      title,
      message,
      type: AlertEnum.Error,
    },
  });
}

export async function getResourceFromCluster(resource: K8sResource, kubeconfigPath: string) {
  const resourceKindHandler = getResourceKindHandler(resource.kind);

  if (resource && resource.text && resourceKindHandler) {
    const kc = new k8s.KubeConfig();
    kc.loadFromFile(kubeconfigPath);

    const resourceFromCluster = await resourceKindHandler.getResourceFromCluster(
      kc,
      resource.content.metadata.name,
      resource.namespace ? resource.namespace : 'default'
    );
    return resourceFromCluster;
  }
}
