import {REGEX_CODE} from './constants';

export function isValidKubernetesYaml(yaml: string) {
  return yaml.includes('apiVersion') && yaml.includes('kind') && yaml.includes('metadata');
}

export function extractYamlDocuments(content: string) {
  const codeMatch = content.match(REGEX_CODE);
  const documents = codeMatch?.map(match => {
    let formatted = match.replaceAll('`', '');
    if (formatted.startsWith('yaml')) {
      formatted = formatted.substring(4);
    }
    return formatted;
  });
  return documents?.filter(isValidKubernetesYaml);
}
