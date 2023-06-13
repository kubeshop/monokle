import {PluginMetadataWithConfig} from '@monokle/validation';

import CRDsSchemaValidation from '../CRDsSchemaValidation/CRDsSchemaValidation';

export const VALIDATION_CONFIGURATION_COMPONENTS: Record<
  string,
  ((props: PluginMetadataWithConfig) => JSX.Element) | false | undefined
> = {
  'CRDs Schema': () => <CRDsSchemaValidation />,
  'kubernetes-schema': false,
  'yaml-syntax': false,
};
