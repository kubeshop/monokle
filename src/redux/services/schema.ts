import fs, {readFileSync} from 'fs';
import {cloneDeep} from 'lodash';
import log from 'loglevel';
import path from 'path';

import {FileMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';

import {loadResource} from '@redux/services';
import {getAbsoluteFilePath} from '@redux/services/fileEntry';
import {isHelmValuesFile} from '@redux/services/helm';
import {isKustomizationResource} from '@redux/services/kustomize';

import {getFileStats} from '@utils/files';

import {getResourceKindHandler} from '@src/kindhandlers';

// @ts-ignore
const objectMetadataSchema = JSON.parse(loadResource('schemas/objectmetadata.json'));
// @ts-ignore
const kustomizeSchema = JSON.parse(loadResource('schemas/kustomization.json'));
const schemaCache = new Map<string, any | undefined>();

// @ts-ignore
const HELM_CHART_SCHEMA = JSON.parse(loadResource('form-schemas/helm-chart-schema.json'));
// @ts-ignore
const HELM_CHART_UI_SCHEMA = JSON.parse(loadResource('form-schemas/helm-chart-ui-schema.json'));

let k8sSchemaCache = new Map<string, any | undefined>();
/**
 * Returns a JSON Schema for the specified resource kind
 */
export function getResourceSchema(resource: K8sResource, schemaVersion: string, userDataDir: string) {
  let k8sSchema: any;

  if (isKustomizationResource(resource)) {
    return kustomizeSchema;
  }

  if (k8sSchemaCache.get(schemaVersion)) {
    k8sSchema = k8sSchemaCache.get(schemaVersion);
  } else {
    // @ts-ignore
    k8sSchema = JSON.parse(
      readFileSync(path.join(String(userDataDir), path.sep, 'schemas', `${schemaVersion}.json`), 'utf-8')
    );
    k8sSchemaCache.clear();
    schemaCache.clear();
    k8sSchemaCache.set(schemaVersion, k8sSchema);
  }

  const resourceKindHandler = getResourceKindHandler(resource.kind);
  const prefix = resourceKindHandler?.validationSchemaPrefix;

  if (prefix) {
    const schemaKey = `${prefix}.${resource.kind}`;
    const schemaCacheKey = `${schemaVersion}-${prefix}.${resource.kind}`;
    if (!schemaCache.has(schemaCacheKey)) {
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

        schemaCache.set(schemaCacheKey, JSON.parse(JSON.stringify(k8sSchema)));
      }
    }

    if (schemaCache.has(schemaCacheKey)) {
      return schemaCache.get(schemaCacheKey);
    }
  } else if (!schemaCache.has(`${schemaVersion}-${resource.kind}`)) {
    if (resourceKindHandler?.sourceEditorOptions?.editorSchema) {
      schemaCache.set(`${schemaVersion}-${resource.kind}`, resourceKindHandler?.sourceEditorOptions?.editorSchema);
    }
  }

  return schemaCache.get(`${schemaVersion}-${resource.kind}`);
}

export function getSchemaForPath(filePath: string, fileMap: FileMapType): any | undefined {
  if (path.basename(filePath.toLowerCase()) === 'chart.yaml') {
    return HELM_CHART_SCHEMA;
  }
  if (fileMap && filePath && isHelmValuesFile(filePath)) {
    // look for values.schema.json file in same folder as values file
    const valuesSchemaFileName = getAbsoluteFilePath(path.join(path.dirname(filePath), 'values.schema.json'), fileMap);
    if (getFileStats(valuesSchemaFileName, true)?.isFile()) {
      try {
        // @ts-ignore
        return JSON.parse(fs.readFileSync(valuesSchemaFileName, 'UTF-8'));
      } catch (e) {
        log.warn('Failed to load values schema file', e);
      }
    }
  }
}

export function getUiSchemaForPath(filePath: string): any | undefined {
  if (path.basename(filePath.toLowerCase()) === 'chart.yaml') {
    return HELM_CHART_UI_SCHEMA;
  }
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

        prop['additionalProperties'] = prop['x-kubernetes-preserve-unknown-fields'];
        delete prop['x-kubernetes-preserve-unknown-fields'];
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
  if (!schemaItem) {
    return;
  }

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
