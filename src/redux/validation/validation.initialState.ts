import {ValidationSliceState} from '@models/validation';

export const validationInitialState: ValidationSliceState = {
  config: {
    plugins: {
      'kubernetes-schema': true,
      'open-policy-agent': true,
      'yaml-syntax': true,
      'resource-links': true,
      labels: false,
    },
    settings: {
      'kubernetes-schema': {
        schemaVersion: '1.24.6',
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
  status: 'uninitialized',
};
