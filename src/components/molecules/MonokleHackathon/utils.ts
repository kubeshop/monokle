import yaml from 'yaml';

import {REGEX_CODE} from './constants';

export function isValidYaml(text: string) {
  try {
    const documents = yaml.parseAllDocuments(text);
    return documents.some(doc => doc.errors.length);
  } catch (e) {
    return false;
  }
}

export function isValidKubernetesYaml(text: string) {
  return text.includes('apiVersion') && text.includes('kind') && text.includes('metadata');
}

export function extractYaml(content: string) {
  let possibleYaml = content.trimEnd().endsWith('```') ? content.substring(0, content.length - 3) : content;
  if (isValidKubernetesYaml(possibleYaml) && isValidYaml(possibleYaml)) {
    return possibleYaml;
  }
  const codeMatch = possibleYaml.match(REGEX_CODE);
  const documents = codeMatch?.map(match => {
    let formatted = match.trim().substring(3, match.length - 3);
    if (formatted.startsWith('yaml')) {
      formatted = formatted.substring(4).trim();
    }
    return formatted;
  });
  return documents?.filter(isValidKubernetesYaml).filter(isValidYaml).join('\n---\n');
}

export const extractYamlDocuments = () => [];
