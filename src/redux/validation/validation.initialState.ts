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
    rules: {
      'open-policy-agent/no-sys-admin': true,
      'open-policy-agent/no-mounted-docker-sock': true,
      'open-policy-agent/no-host-ipc': true,
      'open-policy-agent/no-host-network': true,
      'open-policy-agent/no-host-pid': true,
      'open-policy-agent/no-privileged': true,
      'open-policy-agent/no-host-port-access': true,
    },
  },
  lastResponse: undefined,
  loadRequestId: undefined,
  metadata: undefined,
  rules: undefined,
  status: 'uninitialized',
};
