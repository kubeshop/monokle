import {v4 as uuid} from 'uuid';

import {CommandOptions, HelmEnv, HelmInstallArgs, HelmTemplateArgs} from '@monokle-desktop/shared/models';

export function createHelmInstallCommand(
  {kubeContext, values, name, chart}: HelmInstallArgs,
  env?: HelmEnv
): CommandOptions {
  return {
    commandId: uuid(),
    cmd: 'helm',
    args: ['install', '--kube-context', kubeContext, '-f', `"${values}"`, chart, `"${name}"`, '--dry-run'],
    env,
  };
}

export function createHelmTemplateCommand({values, name, chart}: HelmTemplateArgs, env?: HelmEnv): CommandOptions {
  return {
    commandId: uuid(),
    cmd: 'helm',
    args: ['template', '-f', `"${values}"`, chart, `"${name}"`],
    env,
  };
}
