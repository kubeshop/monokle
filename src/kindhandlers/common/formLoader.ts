import path from 'path';

import {loadResource} from '@redux/services';

const formSchemaCache = new Map<string, any>();
const uiformSchemaCache = new Map<string, any>();

export function getFormSchema(kind: string) {
  try {
    if (!formSchemaCache.has(kind)) {
      const formSchema = loadResource(`form-schemas${path.sep}${kind.toLowerCase()}-schema.json`);
      if (formSchema) {
        formSchemaCache.set(kind, JSON.parse(formSchema));
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
      const uiSchema = loadResource(`form-schemas${path.sep}${kind.toLowerCase()}-ui-schema.json`);
      if (uiSchema) {
        uiformSchemaCache.set(kind, JSON.parse(uiSchema));
      }
    }

    return uiformSchemaCache.get(kind);
  } catch (error) {
    return undefined;
  }
}
