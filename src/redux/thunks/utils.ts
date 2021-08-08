import {PREVIEW_PREFIX, YAML_DOCUMENT_DELIMITER} from '@src/constants';
import {ResourceMapType} from '@models/appstate';
import {clearParsedDocs, extractK8sResources, processParsedResources} from '@redux/services/resource';
import {stringify} from 'yaml';
import {AlertEnum} from '@models/alert';

/**
 * Utility to convert list of objects returned by k8s api to a single YAML document
 */

export function getK8sObjectsAsYaml(items: any[], kind: string, apiVersion: string) {
  return items
    .map(item => {
      delete item.metadata?.managedFields;
      return `apiVersion: ${apiVersion}\nkind: ${kind}\n${stringify(item)}`;
    })
    .join(YAML_DOCUMENT_DELIMITER);
}

/**
 * Creates a preview result from a YAML string containing resources
 */

export function createPreviewResult(resourcesYaml: string, previewResourceId: string, title: string) {
  const resources = extractK8sResources(resourcesYaml, PREVIEW_PREFIX + previewResourceId);
  const resourceMap = resources.reduce((rm: ResourceMapType, r) => {
    rm[r.id] = r;
    return rm;
  }, {});

  processParsedResources(resourceMap);
  return {
    previewResourceId,
    previewResources: clearParsedDocs(resourceMap),
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
