import {v4 as uuid} from 'uuid';

import {CommandOptions} from './execute';

type KubectlEnv = {
  KUBECONFIG?: string;
};

type KubectlApplyArgs = {
  context: string;
  input: string;
  namespace?: string;
};

export function createKubectlApplyCommand(
  {context, namespace, input}: KubectlApplyArgs,
  env?: KubectlEnv
): CommandOptions {
  const args = ['--context', context, 'apply', '-f', '-'];

  if (namespace) {
    args.unshift('--namespace', namespace);
  }

  return {
    commandId: uuid(),
    cmd: 'kubectl',
    args,
    input,
    env,
  };
}
