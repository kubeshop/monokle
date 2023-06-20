import {IconNames} from '@monokle/components';

type CustomValidationPluginId = 'crd-schema';

type CustomValidationPlugin = {
  id: CustomValidationPluginId;
  icon: IconNames;
  name: string;
  description: string;
  learnMoreUrl: string;
  disableToggle?: boolean;
  isConfigurable?: boolean;
};

export const CRD_SCHEMA_INTEGRATION: CustomValidationPlugin = {
  id: 'crd-schema',
  icon: 'crds',
  name: 'CRDs Schemas',
  description: 'Configure schema validation for Custom Resources based on Custom Resource Definitions.',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-crds/',
  disableToggle: true,
  isConfigurable: true,
};

export type {CustomValidationPlugin, CustomValidationPluginId};
