import {PluginMetadataWithConfig} from '@monokle/validation';

export const VALIDATION_CONFIGURATION_COMPONENTS: Record<
  string,
  ((props: PluginMetadataWithConfig) => JSX.Element) | false | undefined
> = {
  'open-policy-agent': false,
  'kubernetes-schema': false,
  'resource-links': false,
  'yaml-syntax': false,
};
