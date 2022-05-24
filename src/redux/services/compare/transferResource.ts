import {cloneDeep} from 'lodash';
import {v4 as uuid} from 'uuid';

import {PREVIEW_PREFIX, UNSAVED_PREFIX} from '@constants/constants';

import {AppDispatch} from '@models/appdispatch';
import {K8sResource} from '@models/k8sresource';
import {RootState} from '@models/rootstate';

import {ResourceSet} from '@redux/reducers/compare';
import {performResourceContentUpdate} from '@redux/reducers/main';
import {currentConfigSelector, kubeConfigContextSelector, kubeConfigPathSelector} from '@redux/selectors';
import {applyResource} from '@redux/thunks/applyResource';
import {getResourceFromCluster} from '@redux/thunks/utils';

import {jsonToYaml} from '@utils/yaml';

type Type = ResourceSet['type'];

export function canTransfer(from: Type | undefined, to: Type | undefined): boolean {
  if (!from || !to) return false;
  return to === 'cluster' || to === 'local';
}

type TransferOptions = {
  from: Type;
  to: Type;
  namespace?: string;
  context?: string;
};

export function doTransferResource(
  source: K8sResource,
  target: K8sResource | undefined,
  options: TransferOptions,
  state: RootState,
  dispatch: AppDispatch
): Promise<K8sResource> {
  switch (options.to) {
    case 'cluster':
      return deployResourceToCluster(source, target, options, state, dispatch);
    case 'local':
      return extractResourceToLocal(source, target, state);
    default:
      throw new Error('transfer unsupported');
  }
}

async function deployResourceToCluster(
  source: K8sResource,
  target: K8sResource | undefined,
  options: TransferOptions,
  state: RootState,
  dispatch: AppDispatch
) {
  const resourceId = source.id;
  const resourceMap = state.main.resourceMap;
  const fileMap = state.main.fileMap;
  const projectConfig = currentConfigSelector(state);
  const currentContext = options.context ?? kubeConfigContextSelector(state);
  const kubeConfigPath = kubeConfigPathSelector(state);
  const namespace = {name: 'default', new: false}; // TODO use modal for confirm + namespace select.

  await applyResource(resourceId, resourceMap, fileMap, dispatch, projectConfig, currentContext, namespace, {
    isClusterPreview: false,
    shouldPerformDiff: false,
    isInClusterDiff: false,
    quiet: true,
  });

  // Remark: Cluster adds defaults so copying the source's content
  // is too naive. Instead fetch remotely and fallback to copy if failed.
  const clusterContent = await getResourceFromCluster(source, kubeConfigPath, currentContext);
  const updatedContent = clusterContent ?? source.content;

  const id = target?.id ?? uuid();
  const resource = createResource(updatedContent, {
    id,
    filePath: `${PREVIEW_PREFIX}://${currentContext}/${id}`,
  });

  return resource;
}

async function extractResourceToLocal(
  source: K8sResource,
  target: K8sResource | undefined,
  state: RootState
): Promise<K8sResource> {
  const resourceMap = state.main.resourceMap;
  const fileMap = state.main.fileMap;

  if (target) {
    const result = {...target};
    performResourceContentUpdate(result, source.content, fileMap, resourceMap);
    return result;
  }

  const result = createResource(source.content, {
    name: source.name,
  });
  return result;
}

function createResource(rawResource: any, overrides?: Partial<K8sResource>): K8sResource {
  const id = uuid();
  const name = rawResource.metadata?.name ?? 'UNKNOWN';

  return {
    id,
    name,
    kind: rawResource.kind,
    version: rawResource.apiVersion,
    content: cloneDeep(rawResource),
    text: jsonToYaml(rawResource),
    filePath: `${UNSAVED_PREFIX}${id}`,
    isHighlighted: false,
    isSelected: false,
    ...overrides,
  };
}
