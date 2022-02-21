import {LineCounter, parseAllDocuments, parseDocument} from 'yaml';

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
