import {cloneDeep} from 'lodash';
import log from 'loglevel';

import {K8sResource} from '@models/k8sresource';

import {loadResource} from '@redux/services';
import {isKustomizationResource} from '@redux/services/kustomize';

import {getResourceKindHandler} from '@src/kindhandlers';

// @ts-ignore
const k8sSchema = JSON.parse(loadResource('schemas/k8sschemas.json'));
// @ts-ignore
const objectMetadataSchema = JSON.parse(loadResource('schemas/objectmetadata.json'));
// @ts-ignore
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
    if (resourceKindHandler?.sourceEditorOptions?.editorSchema) {
      schemaCache.set(resource.kind, resourceKindHandler?.sourceEditorOptions?.editorSchema);
    }
  }

  return schemaCache.get(resource.kind);
}

export function loadCustomSchema(schemaPath: string, resourceKind: string): any | undefined {
  try {
    const schemaText = loadResource(`schemas/${schemaPath}`);
    const schema = schemaText ? JSON.parse(schemaText) : undefined;
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

export function extractSchema(crd: any, versionName: string) {
  const versions: any[] = crd?.spec?.versions || [];
  const version = versions.find((v: any) => v.name === versionName);
  const schema = version?.schema?.openAPIV3Schema;

  if (!schema) {
    log.warn(`Failed to extract schema for version ${versionName} from `, crd);
    return;
  }

  if (!schema.properties) {
    schema.properties = {};
  } else if (schema['x-kubernetes-preserve-unknown-fields'] !== true) {
    schema.additionalProperties = false;
  }

  schema.properties['apiVersion'] = objectMetadataSchema.properties.apiVersion;
  schema.properties['kind'] = objectMetadataSchema.properties.kind;
  schema.properties['metadata'] = objectMetadataSchema.properties.metadata;

  Object.values(schema.properties).forEach((prop: any) => {
    if (prop.type && prop.type === 'object') {
      try {
        if (prop.additionalProperties) {
          delete prop['additionalProperties'];
        }

        prop['additionalProperties'] = false;
      } catch (e) {
        // this could fail - ignore
      }
    }
  });

  return schema;
}

export function removeSchemaDefaults(schema: any, removeObjectDefaults: boolean, removePrimitiveDefaults: boolean) {
  const schemaClone = cloneDeep(schema);
  removeDefaults(schemaClone, removeObjectDefaults, removePrimitiveDefaults);
  return schemaClone;
}

function removeDefaults(schemaItem: any, removeObjectDefaults: boolean, removePrimitiveDefaults: boolean) {
  if (removeObjectDefaults && schemaItem.default && schemaItem.type === 'object') {
    delete schemaItem.default;
  }

  if (schemaItem.properties) {
    Object.values(schemaItem.properties).forEach((prop: any) => {
      if (prop.type === 'object') {
        removeDefaults(prop, removeObjectDefaults, removePrimitiveDefaults);
      } else if (prop.type === 'array') {
        removeDefaults(prop.items, removeObjectDefaults, removePrimitiveDefaults);
      } else if (removePrimitiveDefaults && prop.default !== undefined) {
        delete prop.default;
      }
    });
  }
}
