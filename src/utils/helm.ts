import {isEmpty} from 'lodash';
import log from 'loglevel';
import {dirname, join, sep} from 'path';
import {v4 as uuid} from 'uuid';

import {getHelmClusterArgs} from '@utils/cluster';

import {CommandOptions, HelmEnv, HelmInstallArgs, HelmTemplateArgs} from '@shared/models/commands';
import {HelmChart} from '@shared/models/helm';

export function buildHelmConfigCommand(
  helmChart: HelmChart,
  valuesFilePaths: string[],
  helmCommand: 'template' | 'install',
  options: Record<string, string | null>,
  rootFolderPath: string,
  performDeploy?: boolean
): string[] {
  let chartFolderPath = join(rootFolderPath, dirname(helmChart.filePath));
  let command = performDeploy ? 'install' : helmCommand;

  if (chartFolderPath.endsWith(sep)) {
    chartFolderPath = chartFolderPath.slice(0, -1);
  }

  const args = [
    'helm',
    command,
    ...valuesFilePaths.map(filePath => ['-f', `"${join(rootFolderPath, filePath)}"`]).flat(),
    helmChart.name,
    `"${chartFolderPath}"`,
  ];

  if (options) {
    args.push(
      ...Object.entries(options)
        .map(([key, value]) => (!value ? [key] : [key, `"${value}"`]))
        .flat()
    );
  }

  if (!performDeploy && command === 'install') {
    args.push('--dry-run');
  }

  const clusterArgs = getHelmClusterArgs();
  args.push(...clusterArgs);

  return args;
}

export function createHelmInstallCommand(
  {values, name, chart, dryRun}: HelmInstallArgs,
  env?: HelmEnv
): CommandOptions {
  const clusterArgs = getHelmClusterArgs();

  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['install', ...clusterArgs, '-f', `"${values}"`, chart, `"${name}"`],
    env,
  };
  if (dryRun) {
    command.args.push('--dry-run');
  }
  log.debug('createHelmInstallCommand', command);
  return command;
}

export function createHelmTemplateCommand({values, name, chart}: HelmTemplateArgs, env?: HelmEnv): CommandOptions {
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['template', '-f', `"${values}"`, chart, `"${name}"`],
    env,
  };
  log.debug('createHelmTemplateCommand', command);
  return command;
}

export function listHelmRepoCommand(env?: HelmEnv): CommandOptions {
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['repo', 'list', '-o json'],
    env,
  };
  log.debug('listHelmRepoCommand', command);
  return command;
}

export function addHelmRepoCommand({name, url}: {name: string; url: string}, env?: HelmEnv): CommandOptions {
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['repo', 'add', name, url],
    env,
  };
  log.debug('addHelmRepoCommand', command);
  return command;
}

export function updateHelmRepoCommand({repos = []}: {repos?: string[]}, env?: HelmEnv): CommandOptions {
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['repo', 'update', ...repos],
    env,
  };
  log.debug('updateHelmRepoCommand', command);
  return command;
}

export function removeHelmRepoCommand({repos}: {repos: string[]}, env?: HelmEnv): CommandOptions {
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['repo', 'remove', ...repos],
    env,
  };
  log.debug('removeHelmRepoCommand', command);
  return command;
}

export function indexHelmRepoCommand({dir}: {dir: string}, env?: HelmEnv): CommandOptions {
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['repo', 'index', dir],
    env,
  };
  log.debug('indexHelmRepoCommand', command);
  return command;
}

export function searchHelmRepoCommand({q}: {q: string}, versions?: boolean, env?: HelmEnv): CommandOptions {
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['search', 'repo', q, versions ? '--versions' : '', '-o json'],
    env,
  };
  log.debug('searchHelmRepoCommand', command);
  return command;
}

export function searchHelmHubCommand({q}: {q: string}, env?: HelmEnv): CommandOptions {
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['search', 'hub', q, '-o json'],
    env,
  };
  log.debug('searchHelmHubCommand', command);
  return command;
}

export function helmChartInfoCommand({name}: {name: string}, env?: HelmEnv): CommandOptions {
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['show', 'chart', name],
    env,
  };
  log.debug('helmChartInfoCommand', command);
  return command;
}

export function helmChartReadmeCommand({name}: {name: string}, env?: HelmEnv): CommandOptions {
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['show', 'readme', name],
    env,
  };
  log.debug('helmChartReadmeCommand', command);
  return command;
}

export function helmChartTemplateCommand({name}: {name: string}, env?: HelmEnv): CommandOptions {
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['template', name],
    env,
  };
  log.debug('helmChartTemplateCommand', command);
  return command;
}

export function helmChartValuesCommand({name}: {name: string}, env?: HelmEnv): CommandOptions {
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['show', 'values', name],
    env,
  };
  log.debug('helmChartValuesCommand', command);
  return command;
}

export function helmPullChartCommand(
  {name, path, version}: {name: string; path: string; version?: string},
  env?: HelmEnv
): CommandOptions {
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['pull', name, '--untar', '--untardir', path, version ? `--version ${version}` : ''],
    env,
  };
  log.debug('helmPullChartCommand', command);
  return command;
}

export function installHelmRepoChartCommand(
  {
    chart,
    namespace,
    version,
    shouldCreateNamespace,
  }: {chart: string; namespace?: string; version?: string; shouldCreateNamespace?: boolean},
  env?: HelmEnv
): CommandOptions {
  const clusterArgs = getHelmClusterArgs();
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: [
      'install',
      chart,
      '-g',
      namespace ? `--namespace ${namespace}` : '',
      version ? `--version ${version}` : '',
      shouldCreateNamespace ? '--create-namespace' : '',
      ...clusterArgs,
    ],
    env,
  };
  log.debug('installHelmRepoChartCommand', command);
  return command;
}

export function listHelmReleasesCommand(
  {namespace, filter}: {namespace?: string; filter?: string},
  env?: HelmEnv
): CommandOptions {
  const clusterArgs = getHelmClusterArgs();
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: [
      'list',
      ...clusterArgs,
      !isEmpty(namespace) ? `--namespace ${namespace}` : '--all-namespaces',
      !isEmpty(filter) ? `--filter ${filter}` : '',
      '-o json',
    ],
    env,
  };
  log.debug('listHelmReleasesCommand', command);
  return command;
}

export function helmReleaseRevisionsCommand(
  {release, namespace}: {release: string; namespace: string},
  env?: HelmEnv
): CommandOptions {
  const clusterArgs = getHelmClusterArgs();
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['history', release, ...clusterArgs, '-n', namespace, '-o json'],
    env,
  };
  log.debug('helmReleaseRevisionsCommand', command);
  return command;
}

export function upgradeHelmReleaseCommand(
  {
    release,
    chart,
    namespace,
    version,
    dryRun,
  }: {release: string; chart: string; namespace: string; version?: string; dryRun?: boolean},
  env?: HelmEnv
): CommandOptions {
  const clusterArgs = getHelmClusterArgs();
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: [
      'upgrade',
      release,
      chart,
      dryRun ? '--dry-run' : '',
      ...clusterArgs,
      '-n',
      namespace,
      version ? `--version ${version}` : '',
    ],
    env,
  };
  log.debug('upgradeHelmReleaseCommand', command);
  return command;
}

export function uninstallHelmReleaseCommand(
  {release, namespace, dryRun}: {release: string; namespace: string; dryRun?: boolean},
  env?: HelmEnv
): CommandOptions {
  const clusterArgs = getHelmClusterArgs();
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['uninstall', release, dryRun ? '--dry-run' : '', ...clusterArgs, '-n', namespace],
    env,
  };
  log.debug('uninstallHelmReleaseCommand', command);
  return command;
}

export function getHelmReleaseManifestCommand(
  {release, namespace, revision = -1}: {release: string; namespace: string; revision?: number},
  env?: HelmEnv
): CommandOptions {
  const clusterArgs = getHelmClusterArgs();
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['get', 'manifest', release, revision > -1 ? `--revision ${revision}` : '', ...clusterArgs, '-n', namespace],
    env,
  };
  log.debug('getHelmReleaseManifestCommand', command);
  return command;
}

export function getHelmReleaseValuesCommand(
  {release, namespace}: {release: string; namespace: string},
  env?: HelmEnv
): CommandOptions {
  const clusterArgs = getHelmClusterArgs();
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['get', 'values', release, ...clusterArgs, '-n', namespace],
    env,
  };
  log.debug('getHelmReleaseValuesCommand', command);
  return command;
}

export function getHelmReleaseNotesCommand(
  {release, namespace}: {release: string; namespace: string},
  env?: HelmEnv
): CommandOptions {
  const clusterArgs = getHelmClusterArgs();
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['get', 'notes', release, ...clusterArgs, '-n', namespace],
    env,
  };
  log.debug('getHelmReleaseNotesCommand', command);
  return command;
}

export function getHelmReleaseHooksCommand(
  {release, namespace}: {release: string; namespace: string},
  env?: HelmEnv
): CommandOptions {
  const clusterArgs = getHelmClusterArgs();
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['get', 'hooks', release, ...clusterArgs, '-n', namespace],
    env,
  };
  log.debug('getHelmReleaseHooksCommand', command);
  return command;
}
export function rollbackHelmReleaseCommand(
  {release, namespace, revision}: {release: string; namespace: string; revision: number},
  env?: HelmEnv
): CommandOptions {
  const clusterArgs = getHelmClusterArgs();
  const command = {
    commandId: uuid(),
    cmd: 'helm',
    args: ['rollback', release, revision.toString(), ...clusterArgs, '-n', namespace],
    env,
  };
  log.debug('rollbackHelmReleaseCommand', command);
  return command;
}
