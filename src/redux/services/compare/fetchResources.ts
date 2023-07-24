import fs from 'fs';
import {flatten, sortBy} from 'lodash';
import log from 'loglevel';
import path, {sep} from 'path';
import invariant from 'tiny-invariant';
import {v4 as uuid} from 'uuid';

import {YAML_DOCUMENT_DELIMITER_NEW_LINE} from '@constants/constants';

import {currentConfigSelector, kubeConfigPathSelector} from '@redux/appConfig';
import {createKubeClientWithSetup} from '@redux/cluster/service/kube-client';
import {getCommitResources} from '@redux/git/git.ipc';
import {runKustomize} from '@redux/thunks/preview';

import {buildHelmCommand, createHelmInstallCommand, createHelmTemplateCommand} from '@utils/helm';

import {ERROR_MSG_FALLBACK} from '@shared/constants/constants';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {GitCommitResourcesResult} from '@shared/ipc/git';
import {CommandOptions} from '@shared/models/commands';
import {
  ClusterResourceSet,
  CommandResourceSet,
  CustomHelmResourceSet,
  GitResourceSet,
  HelmResourceSet,
  KustomizeResourceSet,
  LocalResourceSet,
  ResourceSet,
} from '@shared/models/compare';
import {K8sResource} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';
import {selectKubeconfig} from '@shared/utils/cluster/selectors';
import {hasCommandFailed, runCommandInMainThread} from '@shared/utils/commands';
import {isDefined} from '@shared/utils/filter';

import getClusterObjects from '../getClusterObjects';
import {extractK8sResources, joinK8sResource, joinK8sResourceMap} from '../resource';

export async function fetchResources(state: RootState, options: ResourceSet): Promise<K8sResource[]> {
  const {type} = options;

  switch (type) {
    case 'local':
      return fetchLocalResources(state, options);
    case 'cluster':
      return fetchResourcesFromCluster(state, options);
    case 'helm':
      return previewHelmResources(state, options);
    case 'helm-custom':
      return previewCustomHelmResources(state, options);
    case 'kustomize':
      return previewKustomizeResources(state, options);
    case 'git': {
      return fetchGitResources(state, options);
    }
    case 'command': {
      return fetchCommandResources(state, options);
    }
    default:
      throw new Error('Not yet implemented');
  }
}

function fetchLocalResources(state: RootState, options: LocalResourceSet): K8sResource<'local'>[] {
  return Object.values(
    joinK8sResourceMap(state.main.resourceMetaMapByStorage.local, state.main.resourceContentMapByStorage.local)
  ).filter(r => r.origin.filePath.startsWith(options.folder === '<root>' ? '' : `${options.folder}${sep}`));
}

async function fetchGitResources(state: RootState, options: GitResourceSet): Promise<K8sResource<'local'>[]> {
  const {commitHash = ''} = options;

  let filesContent: GitCommitResourcesResult;

  try {
    filesContent = await getCommitResources({localPath: state.config.selectedProjectRootFolder || '', commitHash});
  } catch (e) {
    filesContent = {};
  }

  return Object.entries(filesContent)
    .flatMap(([filePath, content]) => extractK8sResources(content, 'local', {filePath, fileOffset: 0}))
    .filter(resource =>
      `${sep}${resource.origin.filePath.replaceAll('/', sep)}`.startsWith(
        options.folder === '<root>' ? '' : `${options.folder}${sep}`
      )
    );
}

async function fetchCommandResources(state: RootState, options: CommandResourceSet): Promise<K8sResource[]> {
  const command = state.config.projectConfig?.savedCommandMap?.[options.commandId];

  if (!command) {
    return [];
  }

  const result = await runCommandInMainThread({
    commandId: command.id,
    cmd: command.content,
    args: [],
  });

  if (hasCommandFailed(result) || !isDefined(result.stdout)) {
    const msg = result.error ?? result.stderr ?? ERROR_MSG_FALLBACK;
    throw new Error(msg);
  }

  const resources = extractK8sResources(result.stdout, 'preview', {
    preview: {type: 'command', commandId: command.id},
  });
  return resources;
}

async function fetchResourcesFromCluster(
  state: RootState,
  options: ClusterResourceSet
): Promise<K8sResource<'cluster'>[]> {
  try {
    const kubeConfigPath = kubeConfigPathSelector(state);
    const currentContext = options.context;
    const kc = await createKubeClientWithSetup({
      context: currentContext,
      kubeconfig: kubeConfigPath,
      skipHealthCheck: true,
    });

    const res = await getClusterObjects(kc);
    const results = flatten(res);
    const fulfilledResults = results.filter(r => r.status === 'fulfilled' && r.value);

    if (fulfilledResults.length === 0) {
      throw new Error('fetch failed');
    }

    const allYaml = fulfilledResults.map(r => (r as any).value).join(YAML_DOCUMENT_DELIMITER_NEW_LINE);
    return extractK8sResources(allYaml, 'cluster', {context: kc.currentContext});
  } catch (err) {
    log.debug('fetch resources from cluster failed', err);
    throw err;
  }
}

function extractResultFromHelmOutput(result: string) {
  let data = result.trim();

  // remove notes added from NOTES.txt
  let ix = data.indexOf('\nNOTES:');
  if (ix > 0) {
    data = data.substring(0, ix).trim();
  }

  return data;
}

async function previewHelmResources(state: RootState, options: HelmResourceSet): Promise<K8sResource<'preview'>[]> {
  try {
    const {chartId, valuesId} = options;
    const projectConfig = currentConfigSelector(state);
    const kubeconfig = selectKubeconfig(state);

    if (!kubeconfig?.isValid) {
      throw new Error('Kubeconfig is invalid');
    }

    const currentContext = kubeconfig.currentContext;
    const helmPreviewMode = projectConfig.settings ? projectConfig.settings.helmPreviewMode : 'template';

    const chart = state.main.helmChartMap[chartId];
    const valuesFile = state.main.helmValuesMap[valuesId];
    invariant(chart && valuesFile && valuesFile.helmChartId === chart.id, 'invalid_configuration');

    const rootFolder = state.main.fileMap[ROOT_FILE_ENTRY].filePath;
    const folder = path.join(rootFolder, path.dirname(chart.filePath));
    const values = path.join(folder, valuesFile.name);

    if (!fs.existsSync(values)) {
      throw new Error(`Values not found: ${values}`);
    }

    let command: CommandOptions;
    if (helmPreviewMode === 'install') {
      if (!kubeconfig.path || !currentContext) {
        throw new Error('Kube context not found');
      }

      command = createHelmInstallCommand(
        {
          values: path.join(folder, valuesFile.name),
          name: folder,
          chart: chart.name,
        },
        {
          KUBECONFIG: kubeconfig.path,
        }
      );
    } else {
      command = createHelmTemplateCommand(
        {
          values: path.join(folder, valuesFile.name),
          chart: chart.name,
          name: folder,
        },
        {
          KUBECONFIG: kubeconfig.path,
        }
      );
    }

    const result = await runCommandInMainThread(command);

    if (hasCommandFailed(result) || !isDefined(result.stdout)) {
      const msg = result.error ?? result.stderr ?? ERROR_MSG_FALLBACK;
      throw new Error(msg);
    }

    let data = extractResultFromHelmOutput(result.stdout);
    const resources = extractK8sResources(data, 'preview', {
      preview: {type: 'helm', valuesFileId: valuesFile.id, chartId: valuesFile.helmChartId},
    });

    return resources;
  } catch (err) {
    log.debug('preview Helm resources failed', err);
    throw err;
  }
}

async function previewCustomHelmResources(
  state: RootState,
  options: CustomHelmResourceSet
): Promise<K8sResource<'preview'>[]> {
  try {
    const {chartId, configId} = options;
    const kubeconfig = selectKubeconfig(state);

    if (!kubeconfig?.isValid) {
      throw new Error('Kubeconfig is invalid');
    }

    const currentContext = kubeconfig.currentContext;

    const rootFolder = state.main.fileMap[ROOT_FILE_ENTRY].filePath;

    const chart = state.main.helmChartMap[chartId];
    const helmConfig = state.config.projectConfig?.helm?.previewConfigurationMap?.[configId];
    invariant(chart && helmConfig, 'invalid_configuration');

    if (!kubeconfig || !currentContext) return [];

    const valuesFileItems = Object.values(helmConfig.valuesFileItemMap)
      .filter(isDefined)
      .filter(item => item.isChecked);
    const orderedValuesFilePaths = sortBy(valuesFileItems, ['order']).map(i => i.filePath);

    checkAllFilesExist(orderedValuesFilePaths, rootFolder);

    const args = buildHelmCommand(
      chart,
      orderedValuesFilePaths,
      helmConfig.command,
      helmConfig.options,
      rootFolder,
      currentContext
    );

    const command: CommandOptions = {
      commandId: uuid(),
      cmd: 'helm',
      args: args.splice(1),
      env: {KUBECONFIG: kubeconfig.path},
    };

    const result = await runCommandInMainThread(command);

    if (!result.stdout) {
      const msg = result.error ?? result.stderr ?? ERROR_MSG_FALLBACK;
      throw new Error(msg);
    }

    let data = extractResultFromHelmOutput(result.stdout);

    const resources = extractK8sResources(data, 'preview', {
      preview: {type: 'helm-config', configId: helmConfig.id},
    });
    return resources;
  } catch (err) {
    log.debug('preview custom Helm resources failed', err);
    throw err;
  }
}

function checkAllFilesExist(files: string[], root: string): void {
  const valuesFilePathsNotFound: string[] = [];
  files.forEach(filePath => {
    const absoluteFilePath = path.join(root, filePath);
    if (!fs.existsSync(absoluteFilePath)) {
      valuesFilePathsNotFound.push(absoluteFilePath);
    }
  });

  if (valuesFilePathsNotFound.length > 0) {
    const unfoundFiles = valuesFilePathsNotFound.join(', ');
    throw new Error(`Helm Values file not found: ${unfoundFiles}`);
  }
}

async function previewKustomizeResources(
  state: RootState,
  options: KustomizeResourceSet
): Promise<K8sResource<'preview'>[]> {
  try {
    const projectConfig = currentConfigSelector(state);
    const kustomizationMeta = state.main.resourceMetaMapByStorage.local[options.kustomizationId];
    const kustomizationContent = state.main.resourceContentMapByStorage.local[options.kustomizationId];
    const kustomization = joinK8sResource(kustomizationMeta, kustomizationContent);
    const rootFolder = state.main.fileMap[ROOT_FILE_ENTRY].filePath;
    const folder = path.join(rootFolder, path.dirname(kustomization.origin.filePath));
    const result = await runKustomize(folder, projectConfig);

    if (!result.stdout) {
      const msg = result.error ?? result.stderr ?? ERROR_MSG_FALLBACK;
      throw new Error(msg);
    }

    const resources = extractK8sResources(result.stdout, 'preview', {
      preview: {type: 'kustomize', kustomizationId: kustomization.id},
    });
    return resources;
  } catch (err) {
    log.debug('preview Kustomize resources failed', err);
    throw err;
  }
}
