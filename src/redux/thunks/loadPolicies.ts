import {createAsyncThunk} from '@reduxjs/toolkit';

import {v4 as uuid} from 'uuid';

import {AlertEnum} from '@models/alert';
import {BasicPolicy, POLICY_VALIDATOR_MAP, Policy, PolicyConfig, ValidatorId} from '@models/policy';

import {setAlert} from '@redux/reducers/alert';
import {loadBinaryResource} from '@redux/services';

import {loadPolicy} from '@open-policy-agent/opa-wasm';

export const loadPolicies = createAsyncThunk<Policy[]>('main/loadPolicies', async (_, {dispatch}) => {
  try {
    const plugin = DEFAULT_TRIVY_PLUGIN;
    const wasm = loadBinaryResource('policies/bundle/policy.wasm');

    if (!wasm) {
      throw new Error('policy not found');
    }

    const validatorId: ValidatorId = uuid();
    const validator = await loadPolicy(wasm);
    POLICY_VALIDATOR_MAP[validatorId] = validator;

    return [{validatorId, metadata: plugin, config: DEFAULT_CONFIGURATION}];
  } catch (err) {
    dispatch(
      setAlert({
        title: 'Failed to load policy',
        message: (err as Error).message,
        type: AlertEnum.Warning,
      })
    );
    return [];
  }
});

const DEFAULT_CONFIGURATION: PolicyConfig = {enabled: true};

const DEFAULT_TRIVY_PLUGIN: BasicPolicy = {
  name: 'Default Trivy policies',
  id: 'io.kubeshop.monokle.templates.default.policy',
  author: 'kubeshop.io',
  version: '0.1.0',
  description: 'Default policies for Kubernetes resources.',
  type: 'basic',
  module: './policy.wasm',
  rules: [
    {
      id: 'KSV011',
      shortDescription: {
        text: 'The CPU of containers should be limited.',
      },
      help: {
        text: "Add a cpu limitation to 'spec.resources.limits.cpu'.",
      },
      properties: {
        severity: 'low',
        entrypoint: 'appshield/kubernetes/KSV011/deny',
        path: '$container.resources.limits.cpu',
      },
    },
  ],
};
