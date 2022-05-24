import {flatten} from 'lodash';
import log from 'loglevel';
import path from 'path';
import invariant from 'tiny-invariant';

import {
  CLUSTER_DIFF_PREFIX,
  ERROR_MSG_FALLBACK,
  PREVIEW_PREFIX,
  ROOT_FILE_ENTRY,
  YAML_DOCUMENT_DELIMITER_NEW_LINE,
} from '@constants/constants';

import {K8sResource} from '@models/k8sresource';
import {RootState} from '@models/rootstate';

import {ClusterResourceSet, HelmResourceSet, KustomizeResourceSet, ResourceSet} from '@redux/reducers/compare';
import {currentConfigSelector} from '@redux/selectors';
import {runKustomize} from '@redux/thunks/previewKustomization';

import {CommandOptions, runCommandInMainThread} from '@utils/command';
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
    case 'kustomize':
      return previewKustomizeResources(state, options);
    default:
      throw new Error('Not yet implemented');
  }
}

function fetchLocalResources(state: RootState): K8sResource[] {
  return Object.values(state.main.resourceMap).filter(
    resource =>
      !resource.filePath.startsWith(CLUSTER_DIFF_PREFIX) &&
      !resource.name.startsWith('Patch:') &&
      !isKustomizationResource(resource)
  );
}

async function fetchResourcesFromCluster(state: RootState, options: ClusterResourceSet): Promise<K8sResource[]> {
  try {
    const currentContext = options.context;
    const clusterAccess = state.config.projectConfig?.clusterAccess?.filter(ca => ca.context === currentContext) || [];
    const kc = createKubeClient(state.config);

    const res = clusterAccess.length
      ? await Promise.all(clusterAccess.map(ca => getClusterObjects(kc, ca.namespace)))
      : await getClusterObjects(kc);
    const results = flatten(res);
    const fulfilledResults = results.filter(r => r.status === 'fulfilled' && r.value);

    if (fulfilledResults.length === 0) {
      throw new Error('fetch failed');
    }

    const allYaml = fulfilledResults.map(r => (r as any).value).join(YAML_DOCUMENT_DELIMITER_NEW_LINE);
    return extractK8sResources(allYaml, CLUSTER_DIFF_PREFIX + String(kc.currentContext));
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

    if (!kubeconfig || !currentContext) return [];

    const command: CommandOptions = {
      cmd: 'helm',
      args:
        helmPreviewMode === 'template'
          ? ['template', '-f', `"${path.join(folder, valuesFile.name)}"`, chart.name, `"${folder}"`]
          : [
              'install',
              '--kube-context',
              currentContext,
              '-f',
              `"${path.join(folder, valuesFile.name)}"`,
              chart.name,
              `"${folder}"`,
              '--dry-run',
            ],
      env: {KUBECONFIG: kubeconfig},
    };

    const result = await runCommandInMainThread(command);

    if (!result.stdout) {
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
