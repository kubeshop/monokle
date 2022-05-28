import {v4 as uuid} from 'uuid';

import {CommandOptions} from './execute';

type HelmEnv = {
  KUBECONFIG?: string;
};

type HelmInstallArgs = {
  kubeContext: string;
  values: string;
  name: string;
  chart: string;
};

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

type HelmTemplateArgs = {
  values: string;
  name: string;
  chart: string;
};

export function createHelmTemplateCommand({values, name, chart}: HelmTemplateArgs, env?: HelmEnv): CommandOptions {
  return {
    commandId: uuid(),
    cmd: 'helm',
    args: ['template', '-f', `"${values}"`, chart, `"${name}"`],
    env,
  };
}
