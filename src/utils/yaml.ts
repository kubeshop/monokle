import {LineCounter, parseAllDocuments, parseDocument, stringify} from 'yaml';

/**
 * Wrapper that ensures consistent options
 */

export function parseYamlDocument(text: string, lineCounter?: LineCounter) {
  return parseDocument(text, {lineCounter, uniqueKeys: false, strict: false});
}

/**
 * Wrapper that ensures consistent options
 */

export function parseAllYamlDocuments(text: string, lineCounter?: LineCounter) {
  return parseAllDocuments(text, {lineCounter, uniqueKeys: false, strict: false});
}

export function jsonToYaml(resource: any): string {
  return stringify(resource, {
    // In plain mode, scalar value `yes` and `no` are parsed as booleans
    // though most often they are intended as string scalars.
    defaultStringType: 'QUOTE_DOUBLE',
  });
}
