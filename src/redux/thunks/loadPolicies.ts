import {createAsyncThunk} from '@reduxjs/toolkit';

import {v4 as uuid} from 'uuid';

import {AlertEnum} from '@models/alert';
import {BasicPolicy, POLICY_VALIDATOR_MAP, Policy, PolicyConfig, ValidatorId} from '@models/policy';

import {setAlert} from '@redux/reducers/alert';
import {loadBinaryResource} from '@redux/services';

import featureJson from '@src/feature-flags.json';

import {loadPolicy} from '@open-policy-agent/opa-wasm';

export const loadPolicies = createAsyncThunk<Policy[]>('main/loadPolicies', async (_, {dispatch}) => {
  if (!featureJson.ResourceScanning) {
    return [];
  }

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

const DEFAULT_CONFIGURATION: PolicyConfig = {enabled: true, enabledRules: []};

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
      id: 'KSV003',
      shortDescription: {
        text: 'Default capabilities not dropped',
      },
      longDescription: {
        text: 'The container should drop all default capabilities and add only those that are needed for its execution.',
      },
      helpUri: 'https://kubesec.io/basics/containers-securitycontext-capabilities-drop-index-all/',
      help: {
        text: "Add 'ALL' to containers[].securityContext.capabilities.drop.",
      },
      properties: {
        severity: 'low',
        entrypoint: 'appshield/kubernetes/KSV003/deny',
        path: '$container.securityContext.capabilities.drop',
      },
    },
    {
      id: 'KSV011',
      shortDescription: {
        text: 'CPU not limited',
      },
      longDescription: {
        text: 'Enforcing CPU limits prevents DoS via resource exhaustion.',
      },
      helpUri:
        'https://cloud.google.com/blog/products/containers-kubernetes/kubernetes-best-practices-resource-requests-and-limits',
      help: {
        text: "Add a cpu limitation to 'spec.resources.limits.cpu'.",
      },
      properties: {
        severity: 'low',
        entrypoint: 'appshield/kubernetes/KSV011/deny',
        path: '$container.resources.limits.cpu',
      },
    },
    {
      id: 'KSV013',
      shortDescription: {
        text: 'Image tag ":latest" used',
      },
      longDescription: {
        text: "It is best to avoid using the ':latest' image tag when deploying containers in production. Doing so makes it hard to track which version of the image is running, and hard to roll back the version.",
      },
      helpUri: 'https://kubernetes.io/docs/concepts/configuration/overview/#container-images',
      help: {
        text: "Use a specific container image tag that is not 'latest'.",
      },
      properties: {
        severity: 'low',
        entrypoint: 'appshield/kubernetes/KSV013/deny',
        path: '$container.image',
      },
    },
    {
      id: 'KSV015',
      shortDescription: {
        text: 'CPU requests not specified',
      },
      longDescription: {
        text: 'When containers have resource requests specified, the scheduler can make better decisions about which nodes to place pods on, and how to deal with resource contention.',
      },
      helpUri: 'https://kubesec.io/basics/containers-securitycontext-capabilities-drop-index-all/',
      help: {
        text: "Set 'containers[].resources.requests.cpu'.",
      },
      properties: {
        severity: 'low',
        entrypoint: 'appshield/kubernetes/KSV015/deny',
        path: '$container.resources.requests.cpu',
      },
    },
    {
      id: 'KSV016',
      shortDescription: {
        text: 'Memory requests not specified',
      },
      longDescription: {
        text: 'When containers have memory requests specified, the scheduler can make better decisions about which nodes to place pods on, and how to deal with resource contention.',
      },
      helpUri: 'https://kubesec.io/basics/containers-resources-limits-memory/',
      help: {
        text: "Set 'containers[].resources.requests.memory'.",
      },
      properties: {
        severity: 'low',
        entrypoint: 'appshield/kubernetes/KSV016/deny',
        path: '$container.resources.requests.memory',
      },
    },
    {
      id: 'KSV018',
      shortDescription: {
        text: 'Memory not limited',
      },
      longDescription: {
        text: 'Enforcing memory limits prevents DoS via resource exhaustion.',
      },
      helpUri: 'https://kubesec.io/basics/containers-resources-limits-memory/',
      help: {
        text: "Set a limit value under 'containers[].resources.limits.memory'.",
      },
      properties: {
        severity: 'low',
        entrypoint: 'appshield/kubernetes/KSV018/deny',
        path: '$container.resources.limits.memory',
      },
    },
    {
      id: 'KSV021',
      shortDescription: {
        text: 'Runs with low group ID',
      },
      longDescription: {
        text: 'Force the container to run with group ID > 10000 to avoid conflicts with the host’s user table.',
      },
      helpUri: 'https://kubesec.io/basics/containers-securitycontext-runasuser/',
      help: {
        text: "Set 'containers[].securityContext.runAsGroup' to an integer > 10000.",
      },
      properties: {
        severity: 'medium',
        entrypoint: 'appshield/kubernetes/KSV021/deny',
        path: '$container.securityContext.runAsGroup',
      },
    },
    {
      id: 'KSV014',
      shortDescription: {
        text: 'Root file system is not read-only',
      },
      longDescription: {
        text: 'An immutable root file system prevents applications from writing to their local disk. This can limit intrusions, as attackers will not be able to tamper with the file system or write foreign executables to disk.',
      },
      helpUri: 'https://kubesec.io/basics/containers-securitycontext-readonlyrootfilesystem-true/',
      help: {
        text: "Change 'containers[].securityContext.readOnlyRootFilesystem' to 'true'.",
      },
      properties: {
        severity: 'low',
        entrypoint: 'appshield/kubernetes/KSV014/deny',
        path: '$container.securityContext.readOnlyRootFilesystem',
      },
    },
    {
      id: 'KSV029',
      shortDescription: {
        text: 'Runs with low group ID',
      },
      longDescription: {
        text: 'Force the container to run with group ID > 10000 to avoid conflicts with the host’s user table.',
      },
      helpUri: 'https://kubesec.io/basics/containers-securitycontext-runasuser/',
      help: {
        text: "Set 'containers[].securityContext.runAsGroup' to an integer > 10000.",
      },
      properties: {
        severity: 'medium',
        entrypoint: 'appshield/kubernetes/KSV029/deny',
        path: '$container.securityContext.runAsGroup',
      },
    },
  ],
};
