import {KubernetesObject} from '@kubernetes/client-node';

import {cloneDeep, noop} from 'lodash';
import {v4 as uuid} from 'uuid';

import {PREVIEW_PREFIX, UNSAVED_PREFIX} from '@constants/constants';

import {kubeConfigPathSelector} from '@redux/selectors';
import {updateResource} from '@redux/thunks/updateResource';
import {createNamespace, getNamespace, getResourceFromCluster, removeNamespaceFromCluster} from '@redux/thunks/utils';

import {execute} from '@utils/commands';
import {createKubectlApplyCommand} from '@utils/commands/kubectl';
import {createKubeClient} from '@utils/kubeclient';
import {jsonToYaml} from '@utils/yaml';

import {getResourceKindHandler} from '@src/kindhandlers';

import {AppDispatch} from '@shared/models/appDispatch';
import {ResourceSet} from '@shared/models/compare';
import {K8sResource} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';
import {kubeConfigContextSelector} from '@shared/utils/selectors';

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
      return deployResourceToCluster(source, target, options, state);
    case 'local':
      return extractResourceToLocal(source, target, dispatch);
    default:
      throw new Error('transfer unsupported');
  }
}

async function deployResourceToCluster(
  source: K8sResource,
  target: K8sResource | undefined,
  options: TransferOptions,
  state: RootState
) {
  const currentContext = options.context ?? kubeConfigContextSelector(state);
  const kubeConfigPath = kubeConfigPathSelector(state);
  const namespace = source.namespace ?? options.namespace ?? 'default';
  const kubeClient = createKubeClient(kubeConfigPath, currentContext);
  const hasNamespace = await getNamespace(kubeClient, namespace);

  try {
    if (!hasNamespace) {
      await createNamespace(kubeClient, namespace);
    }

    const cmd = createKubectlApplyCommand(
      {
        context: currentContext,
        namespace,
        input: jsonToYaml(source.content),
      },
      {
        KUBECONFIG: kubeConfigPath,
      }
    );

    await execute(cmd);
  } catch (err) {
    if (!hasNamespace) {
      // Best-effort attempt to revert the newly created namespace.
      await removeNamespaceFromCluster(namespace, kubeConfigPath, currentContext).catch(noop);
    }
    throw err;
  }

  // Remark: Cluster adds defaults so copying the source's content
  // is too naive. Instead fetch remotely and fallback to copy if failed.
  let updatedContent: KubernetesObject;
  try {
    const sourceCopy = structuredClone(source);
    sourceCopy.namespace = namespace;
    const clusterContent = await getResourceFromCluster(sourceCopy, kubeConfigPath, currentContext);
    updatedContent = clusterContent ?? source.content;
  } catch {
    updatedContent = source.content;
  }

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
  dispatch: AppDispatch
): Promise<K8sResource> {
  if (target) {
    const result = structuredClone(target);
    result.text = source.text;
    await dispatch(updateResource({resourceId: target.id, text: source.text}));
    return result;
  }

  return createResource(source.content, {
    name: source.name,
  });
}

function createResource(rawResource: any, overrides?: Partial<K8sResource>): K8sResource {
  const id = uuid();
  const name = rawResource.metadata?.name ?? 'UNKNOWN';

  return {
    id,
    name,
    kind: rawResource.kind,
    apiVersion: rawResource.apiVersion,
    content: cloneDeep(rawResource),
    text: jsonToYaml(rawResource),
    fileId: `${UNSAVED_PREFIX}${id}`,
    filePath: `${UNSAVED_PREFIX}${id}`,
    fileOffset: 0,
    isHighlighted: false,
    isSelected: false,
    isClusterScoped: getResourceKindHandler(rawResource.kind)?.isNamespaced || false,
    ...overrides,
  };
}
