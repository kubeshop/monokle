import {ValidationState} from '@shared/models/validation';
import electronStore from '@shared/utils/electronStore';

export const validationInitialState: ValidationState = {
  config: electronStore.get('validation.config') || {
    plugins: {
      'kubernetes-schema': true,
      'open-policy-agent': true,
      'yaml-syntax': true,
      'resource-links': true,
    },
    settings: {
      'kubernetes-schema': {
        schemaVersion: '1.26.0',
      },
    },
  },
  lastResponse: undefined,
  loadRequestId: undefined,
  metadata: undefined,
  rules: undefined,
  status: 'uninitialized',
  validationOverview: {
    filters: {
      'tool-component': undefined,
      type: undefined,
    },
    newProblemsIntroducedType: 'initial',
  },
  configure: {
    integration: undefined,
  },
};
