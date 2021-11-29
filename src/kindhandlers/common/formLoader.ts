import {loadResource} from '@redux/services';

const formSchemaCache = new Map<string, any>();
const uiformSchemaCache = new Map<string, any>();

export function getFormSchema(kind: string) {
  try {
    // if (!formSchemaCache.has(kind)) {
    formSchemaCache.set(kind, JSON.parse(loadResource(`form-schemas/${kind.toLowerCase()}-schema.json`)));
    // }

    return formSchemaCache.get(kind);
  } catch (error) {
    return undefined;
  }
}

export function getUiSchema(kind: string) {
  try {
    // if (!uiformSchemaCache.has(kind)) {
    uiformSchemaCache.set(kind, JSON.parse(loadResource(`form-schemas/${kind.toLowerCase()}-ui-schema.json`)));
    // }

    return uiformSchemaCache.get(kind);
  } catch (error) {
    return undefined;
  }
}
