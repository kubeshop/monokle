import path from 'path';

import {loadResource} from '@redux/services';

const formSchemaCache = new Map<string, any>();
const uiformSchemaCache = new Map<string, any>();

export function getFormSchema(kind: string) {
  try {
    if (!formSchemaCache.has(kind)) {
      const metadataSchema = loadResource(`form-schemas${path.sep}metadata-schema.json`);
      const formSchema = loadResource(`form-schemas${path.sep}${kind.toLowerCase()}-schema.json`);
      if (formSchema && metadataSchema) {
        const formSchemaJson = JSON.parse(formSchema);
        formSchemaCache.set(kind, {
          ...formSchemaJson,
          properties: {...JSON.parse(metadataSchema).properties, ...formSchemaJson.properties},
        });
      }
    }

    return formSchemaCache.get(kind);
  } catch (error) {
    return undefined;
  }
}

export function getUiSchema(kind: string) {
  try {
    if (!uiformSchemaCache.has(kind)) {
      const metadataUISchema = loadResource(`form-schemas${path.sep}metadata-ui-schema.json`);
      const uiSchema = loadResource(`form-schemas${path.sep}${kind.toLowerCase()}-ui-schema.json`);
      if (uiSchema && metadataUISchema) {
        uiformSchemaCache.set(kind, {...JSON.parse(metadataUISchema), ...JSON.parse(uiSchema)});
      }
    }

    return uiformSchemaCache.get(kind);
  } catch (error) {
    return undefined;
  }
}
