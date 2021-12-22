import log from 'loglevel';

import {K8sResource} from '@models/k8sresource';

import {loadResource} from '@redux/services';
import {isKustomizationResource} from '@redux/services/kustomize';

import {getResourceKindHandler} from '@src/kindhandlers';

const k8sSchema = JSON.parse(loadResource('schemas/k8sschemas.json'));
const objectMetadataSchema = JSON.parse(loadResource('schemas/objectmetadata.json'));
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

export function loadCustomSchema(schemaPath: string, resourceKind: string): any | undefined {
  try {
    const schema = JSON.parse(loadResource(`schemas/${schemaPath}`));
    if (schema) {
      if (!schema.properties?.apiVersion) {
        schema.properties['apiVersion'] = objectMetadataSchema.properties.apiVersion;
      }
      if (!schema.properties?.kind) {
        schema.properties['kind'] = objectMetadataSchema.properties.kind;
      }
      if (!schema.properties?.metadata) {
        schema.properties['metadata'] = objectMetadataSchema.properties.metadata;
      }

      schemaCache.set(resourceKind, schema);
      return schema;
    }
  } catch (e) {
    log.warn(`Failed to load custom schema from ${schemaPath}`);
    schemaCache.set(resourceKind, undefined);
  }
}
