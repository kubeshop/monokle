import {createAsyncThunk} from '@reduxjs/toolkit';

import {AlertEnum} from '@models/alert';
import {AppDispatch} from '@models/appdispatch';
import {BasicPolicy, LoadedPolicy, PolicyConfig} from '@models/policy';
import {RootState} from '@models/rootstate';

import {setAlert} from '@redux/reducers/alert';
import {loadBinaryResource} from '@redux/services';

import {loadPolicy} from '@open-policy-agent/opa-wasm';

export const loadPolicies = createAsyncThunk<
  LoadedPolicy[],
  undefined,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/loadPolicies', async (_, {dispatch}) => {
  try {
    const plugin = DEFAULT_TRIVY_PLUGIN;
    const wasm = loadBinaryResource('policies/bundle/policy.wasm');

    if (!wasm) {
      throw new Error('policy not found');
    }

    const validator = await loadPolicy(wasm);

    return [{validator, metadata: plugin, config: DEFAULT_CONFIGURATION}];
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
