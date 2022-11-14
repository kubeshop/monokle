import {IconNames} from './icons';

export type ValidationIntegrationId =
  | 'k8s-schema'
  | 'open-policy-agent'
  | 'resource-links'
  | 'yaml-syntax'
  | 'crd-schema';

export type ValidationIntegration = {
  id: ValidationIntegrationId;
  icon: IconNames;
  name: string;
  description: string;
  learnMoreUrl: string;
  isConfigurable?: boolean;
};

export const K8S_SCHEMA_INTEGRATION: ValidationIntegration = {
  id: 'k8s-schema',
  icon: 'k8s-schema',
  name: 'Kubernetes Schema',
  description:
    'Validates that your manifests have the correct properties/values defined in the schema for their resource kind/version. Always enabled. (Configure it under project settings: "Kubernetes Version" option).',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
};

export const OPA_INTEGRATION: ValidationIntegration = {
  id: 'open-policy-agent',
  icon: 'open-policy-agent',
  name: 'Open Policy Agent',
  description:
    'Open Policy Agent Policy-based control for cloud native environments. Flexible, fine-grained control for administrators across the stack.',
  learnMoreUrl: 'https://github.com/open-policy-agent/opa',
  isConfigurable: true,
};

export const RESOURCE_LINKS_INTEGRATION: ValidationIntegration = {
  id: 'resource-links',
  icon: 'resource-links',
  name: 'Resource Links',
  description:
    'Validates that references to other resources are valid. Always enabled. (Configure it under project settings: "Ignore optional unsatisfied links" option).',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
};

export const YAML_SYNTAX_INTEGRATION: ValidationIntegration = {
  id: 'yaml-syntax',
  icon: 'yaml-syntax',
  name: 'YAML Syntax',
  description: 'Validates that your manifests have correct YAML syntax. Always enabled.',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
};

export const CRD_SCHEMA_INTEGRATION: ValidationIntegration = {
  id: 'crd-schema',
  icon: 'crds',
  name: 'CRDs Schema',
  description: 'Configure schema validation for Custom Resources based on Custom Resource Definitions.',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-crds/',
  isConfigurable: true,
};
