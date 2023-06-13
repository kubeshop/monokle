import {PluginMetadataWithConfig} from '@monokle/validation';

import CRDsSchemaValidation from '../CRDsSchemaValidation/CRDsSchemaValidation';
import ValidationOpenPolicyAgent from '../ValidationOpenPolicyAgent';

export const VALIDATION_CONFIGURATION_COMPONENTS: Record<
  string,
  ((props: PluginMetadataWithConfig) => JSX.Element) | false | undefined
> = {
  'CRDs Schema': () => <CRDsSchemaValidation />,
  'open-policy-agent': () => <ValidationOpenPolicyAgent />,
  'kubernetes-schema': false,
  'resource-links': false,
  'yaml-syntax': false,
};
