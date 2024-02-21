import {v4 as uuid} from 'uuid';

import {CommandOptions, KubectlApplyArgs, KubectlEnv} from '@shared/models/commands';

export function createKubectlApplyCommand(
  {context, namespace, input}: KubectlApplyArgs,
  env?: KubectlEnv
): CommandOptions {
  const args = ['--context', JSON.stringify(context), 'apply', '-f', '-'];

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
