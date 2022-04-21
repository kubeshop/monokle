import {IconNames} from '@components/atoms/Icon';

import {Url} from '@utils/types';

export type ValidationIntegrationId = 'open-policy-agent';

export type ValidationIntegration = {
  id: ValidationIntegrationId;
  icon: IconNames;
  name: string;
  description: string;
  learnMoreUrl: Url;
};

export const OPA_INTEGRATION: ValidationIntegration = {
  id: 'open-policy-agent',
  icon: 'open-policy-agent',
  name: 'Open Policy Agent',
  description:
    'Open Policy Agent Policy-based control for cloud native environments. Flexible, fine-grained control for administrators across the stack.',
  learnMoreUrl: 'https://github.com/open-policy-agent/opa',
};
