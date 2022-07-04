import fs from 'fs';
import {flatten, sortBy} from 'lodash';
import log from 'loglevel';
import path from 'path';
import invariant from 'tiny-invariant';
import {v4 as uuid} from 'uuid';

import {
  ERROR_MSG_FALLBACK,
  PREVIEW_PREFIX,
  ROOT_FILE_ENTRY,
  YAML_DOCUMENT_DELIMITER_NEW_LINE,
} from '@constants/constants';

import {K8sResource} from '@models/k8sresource';
import {RootState} from '@models/rootstate';

import {
  ClusterResourceSet,
  CustomHelmResourceSet,
  HelmResourceSet,
  KustomizeResourceSet,
  ResourceSet,
} from '@redux/compare';
import {currentConfigSelector, kubeConfigPathSelector} from '@redux/selectors';
import {runKustomize} from '@redux/thunks/previewKustomization';

import {
  CommandOptions,
  createHelmInstallCommand,
  createHelmTemplateCommand,
  hasCommandFailed,
  runCommandInMainThread,
} from '@utils/commands';
import {isDefined} from '@utils/filter';
import {buildHelmCommand} from '@utils/helm';
import {createKubeClient} from '@utils/kubeclient';

import getClusterObjects from '../getClusterObjects';
import {isKustomizationResource} from '../kustomize';
import {extractK8sResources} from '../resource';

export async function fetchResources(state: RootState, options: ResourceSet): Promise<K8sResource[]> {
  const {type} = options;

  switch (type) {
    case 'local':
      return fetchLocalResources(state);
    case 'cluster':
      return fetchResourcesFromCluster(state, options);
    case 'helm':
      return previewHelmResources(state, options);
    case 'helm-custom':
      return previewCustomHelmResources(state, options);
    case 'kustomize':
      return previewKustomizeResources(state, options);
    default:
      throw new Error('Not yet implemented');
  }
}

function fetchLocalResources(state: RootState): K8sResource[] {
  return Object.values(state.main.resourceMap).filter(
    resource =>
      !resource.filePath.startsWith(PREVIEW_PREFIX) &&
      !resource.name.startsWith('Patch:') &&
      !isKustomizationResource(resource)
  );
}

async function fetchResourcesFromCluster(state: RootState, options: ClusterResourceSet): Promise<K8sResource[]> {
  try {
    const kubeConfigPath = kubeConfigPathSelector(state);
    const currentContext = options.context;
    const clusterAccess = state.config.projectConfig?.clusterAccess?.filter(ca => ca.context === currentContext) || [];
    const kc = createKubeClient(kubeConfigPath, currentContext);

    const res = clusterAccess.length
      ? await Promise.all(clusterAccess.map(ca => getClusterObjects(kc, ca.namespace)))
      : await getClusterObjects(kc);
    const results = flatten(res);
    const fulfilledResults = results.filter(r => r.status === 'fulfilled' && r.value);

    if (fulfilledResults.length === 0) {
      throw new Error('fetch failed');
    }

    const allYaml = fulfilledResults.map(r => (r as any).value).join(YAML_DOCUMENT_DELIMITER_NEW_LINE);
    return extractK8sResources(allYaml, String(kc.currentContext));
  } catch (err) {
    log.debug('fetch resources from cluster failed', err);
    throw err;
  }
}

async function previewHelmResources(state: RootState, options: HelmResourceSet): Promise<K8sResource[]> {
  try {
    const {chartId, valuesId} = options;
    const projectConfig = currentConfigSelector(state);
    const kubeconfig = projectConfig.kubeConfig?.path;
    const currentContext = projectConfig.kubeConfig?.currentContext;
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
      if (!kubeconfig || !currentContext) {
        throw new Error('Kube context not found');
      }

      command = createHelmInstallCommand(
        {
          kubeContext: currentContext,
          values: path.join(folder, valuesFile.name),
          name: folder,
          chart: chart.name,
        },
        {
          KUBECONFIG: kubeconfig,
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
          KUBECONFIG: kubeconfig,
        }
      );
    }

    const result = await runCommandInMainThread(command);

    if (hasCommandFailed(result) || !isDefined(result.stdout)) {
      const msg = result.error ?? result.stderr ?? ERROR_MSG_FALLBACK;
      throw new Error(msg);
    }

    const resources = extractK8sResources(result.stdout, PREVIEW_PREFIX + valuesFile.id);

    return resources;
  } catch (err) {
    log.debug('preview Helm resources failed', err);
    throw err;
  }
}

async function previewCustomHelmResources(state: RootState, options: CustomHelmResourceSet): Promise<K8sResource[]> {
  try {
    const {chartId, configId} = options;
    const projectConfig = currentConfigSelector(state);
    const kubeconfig = projectConfig.kubeConfig?.path;
    const currentContext = projectConfig.kubeConfig?.currentContext;
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
      env: {KUBECONFIG: kubeconfig},
    };

    const result = await runCommandInMainThread(command);

    if (!result.stdout) {
      const msg = result.error ?? result.stderr ?? ERROR_MSG_FALLBACK;
      throw new Error(msg);
    }

    const resources = extractK8sResources(result.stdout, PREVIEW_PREFIX + helmConfig.id);
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

async function previewKustomizeResources(state: RootState, options: KustomizeResourceSet): Promise<K8sResource[]> {
  try {
    const projectConfig = currentConfigSelector(state);
    const kustomization = state.main.resourceMap[options.kustomizationId];
    const rootFolder = state.main.fileMap[ROOT_FILE_ENTRY].filePath;
    const folder = path.join(rootFolder, path.dirname(kustomization.filePath));
    const result = await runKustomize(folder, projectConfig);

    if (!result.stdout) {
      const msg = result.error ?? result.stderr ?? ERROR_MSG_FALLBACK;
      throw new Error(msg);
    }

    const resources = extractK8sResources(result.stdout, PREVIEW_PREFIX + kustomization.id);
    return resources;
  } catch (err) {
    log.debug('preview Kustomize resources failed', err);
    throw err;
  }
}
