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
      'open-policy-agent/no-sys-admin': 'err',
      'open-policy-agent/no-mounted-docker-sock': 'err',
      'open-policy-agent/no-host-ipc': 'err',
      'open-policy-agent/no-host-network': 'err',
      'open-policy-agent/no-host-pid': 'err',
      'open-policy-agent/no-privileged': 'err',
      'open-policy-agent/no-host-port-access': 'err',
      'open-policy-agent/no-elevated-process': 'err',
      'open-policy-agent/app-armor': 'err',
      'open-policy-agent/drop-capabilities': 'err',
      'open-policy-agent/cpu-limit': 'err',
      'open-policy-agent/run-as-non-root': 'err',
      'open-policy-agent/no-latest-image': 'err',
      'open-policy-agent/no-writable-fs': 'err',
      'open-policy-agent/cpu-request': 'err',
      'open-policy-agent/memory-request': 'err',
      'open-policy-agent/memory-limit': 'err',
      'open-policy-agent/no-low-user-id': 'err',
      'open-policy-agent/no-low-group-id': 'err',
      'open-policy-agent/no-host-mounted-path': 'err',
      'open-policy-agent/no-selinux': 'err',
      'open-policy-agent/no-proc-mount': 'err',
      'open-policy-agent/no-non-emphemeral-volumes': 'err',
      'open-policy-agent/no-root-group': 'err',
      'open-policy-agent/seccomp-profile': 'err',
      'kubernetes-schema/schema-violated': 'err',
      'resource-links/no-missing-links': 'err',
      'resource-links/no-missing-optional-links': 'err',
    },
  },
  lastResponse: undefined,
  loadRequestId: undefined,
  metadata: undefined,
  rules: undefined,
  status: 'uninitialized',
  validationOverview: {},
};
