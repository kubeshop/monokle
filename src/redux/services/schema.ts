import log from 'loglevel';

import {K8sResource} from '@models/k8sresource';

import {loadResource} from '@redux/services';
import {isKustomizationResource} from '@redux/services/kustomize';

import {getResourceKindHandler} from '@src/kindhandlers';

const k8sSchema = JSON.parse(loadResource('schemas/k8sschemas.json'));
const kustomizeSchema = JSON.parse(loadResource('schemas/kustomization.json'));
const schemaCache = new Map<string, any | undefined>();

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
    const schemaKey = `${prefix}.${resource.kind}`;
    if (!schemaCache.has(schemaKey)) {
      const kindSchema = k8sSchema['definitions'][schemaKey];
      if (kindSchema) {
        Object.keys(k8sSchema).forEach(key => {
          if (key !== 'definitions') {
            delete k8sSchema[key];
          }
        });

        Object.keys(kindSchema).forEach(key => {
          k8sSchema[key] = JSON.parse(JSON.stringify(kindSchema[key]));
        });

        schemaCache.set(schemaKey, JSON.parse(JSON.stringify(k8sSchema)));
      }
    }

    if (schemaCache.has(schemaKey)) {
      return schemaCache.get(schemaKey);
    }
  } else if (!schemaCache.has(resource.kind)) {
    log.warn(`Failed to find schema for resource of kind ${resource.kind}`);
    schemaCache.set(resource.kind, undefined);
  }

  return schemaCache.get(resource.kind);
}
