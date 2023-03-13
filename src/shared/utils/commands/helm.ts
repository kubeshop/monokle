import {v4 as uuid} from 'uuid';

import {CommandOptions, HelmEnv, HelmInstallArgs, HelmTemplateArgs} from '@shared/models/commands';

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

export function listHelmRepoCommand(env?: HelmEnv): CommandOptions {
  return {
    commandId: uuid(),
    cmd: 'helm',
    args: ['repo', 'list', '-o json'],
    env,
  };
}

export function addHelmRepoCommand({name, url}: {name: string; url: string}, env?: HelmEnv): CommandOptions {
  return {
    commandId: uuid(),
    cmd: 'helm',
    args: ['repo', 'add', name, url],
    env,
  };
}

export function updateHelmRepoCommand({repos = []}: {repos?: string[]}, env?: HelmEnv): CommandOptions {
  return {
    commandId: uuid(),
    cmd: 'helm',
    args: ['repo', 'update', ...repos],
    env,
  };
}

export function removeHelmRepoCommand({repos}: {repos: string[]}, env?: HelmEnv): CommandOptions {
  return {
    commandId: uuid(),
    cmd: 'helm',
    args: ['repo', 'remove', ...repos],
    env,
  };
}

export function indexHelmRepoCommand({dir}: {dir: string}, env?: HelmEnv): CommandOptions {
  return {
    commandId: uuid(),
    cmd: 'helm',
    args: ['repo', 'index', dir],
    env,
  };
}

export function searchHelmRepoCommand({q}: {q: string}, env?: HelmEnv): CommandOptions {
  return {
    commandId: uuid(),
    cmd: 'helm',
    args: ['search', 'repo', q, '-o json'],
    env,
  };
}

export function helmChartInfoCommand({name}: {name: string}, env?: HelmEnv): CommandOptions {
  return {
    commandId: uuid(),
    cmd: 'helm',
    args: ['show', 'chart', name],
    env,
  };
}

export function helmChartReadmeCommand({name}: {name: string}, env?: HelmEnv): CommandOptions {
  return {
    commandId: uuid(),
    cmd: 'helm',
    args: ['show', 'readme', name],
    env,
  };
}

export function helmChartTemplateCommand({name}: {name: string}, env?: HelmEnv): CommandOptions {
  return {
    commandId: uuid(),
    cmd: 'helm',
    args: ['template', name],
    env,
  };
}

export function helmChartValuesCommand({name}: {name: string}, env?: HelmEnv): CommandOptions {
  return {
    commandId: uuid(),
    cmd: 'helm',
    args: ['show', 'values', name],
    env,
  };
}
