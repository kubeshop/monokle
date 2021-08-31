import {K8sResource} from '@models/k8sresource';
import log from 'loglevel';
import {loadResource} from '@redux/services';
import {isKustomizationResource} from '@redux/services/kustomize';
import {getResourceKindHandler} from '@src/kindhandlers';

const k8sSchema = JSON.parse(loadResource('schemas/k8sschemas.json'));
const kustomizeSchema = JSON.parse(loadResource('schemas/kustomization.json'));

/**
 * Returns a JSON Schema for the specified resource kind
 */
export function getResourceSchema(resource: K8sResource) {
  if (isKustomizationResource(resource)) {
    return kustomizeSchema;
  }

  const resourceKindHandler = getResourceKindHandler(resource.kind);
  const prefix = resourceKindHandler?.validationSchemaPrefix;

  if (prefix) {
    const kindSchema = k8sSchema['definitions'][`${prefix}.${resource.kind}`];

    Object.keys(k8sSchema).forEach(key => {
      if (key !== 'definitions') {
        delete k8sSchema[key];
      }
    });

    Object.keys(kindSchema).forEach(key => {
      k8sSchema[key] = JSON.parse(JSON.stringify(kindSchema[key]));
    });

    return k8sSchema;
  }

  log.error(`Failed to find schema for resource of kind ${resource.kind}`);
  return undefined;
}
