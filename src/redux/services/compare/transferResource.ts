import {KubernetesObject} from '@kubernetes/client-node';

import {cloneDeep} from 'lodash';
import {v4 as uuid} from 'uuid';

import {kubeConfigContextSelector, kubeConfigPathSelector} from '@redux/appConfig';
import {updateResource} from '@redux/thunks/updateResource';
import {createNamespace, getNamespace, getResourceFromCluster} from '@redux/thunks/utils';

import {jsonToYaml} from '@utils/yaml';

import {getResourceKindHandler} from '@src/kindhandlers';

import {AppDispatch} from '@shared/models/appDispatch';
import {ResourceSet} from '@shared/models/compare';
import {K8sResource} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';
import {execute} from '@shared/utils/commands';
import {createKubectlApplyCommand} from '@shared/utils/commands/kubectl';
import {createKubeClient} from '@shared/utils/kubeclient';

import {k8sApi} from '../K8sApi';

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
      return extractResourceToLocal(source, target, dispatch);
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
        input: jsonToYaml(source.object),
      },
      {
        KUBECONFIG: kubeConfigPath,
      }
    );

    await execute(cmd);
  } catch (err) {
    if (!hasNamespace) {
      // Best-effort attempt to revert the newly created namespace.

      //  await removeNamespaceFromCluster(namespace, kubeConfigPath, currentContext).catch(noop);
      await dispatch(k8sApi.endpoints.deleteNamespace.initiate({namespace})).unwrap();
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
    updatedContent = clusterContent ?? source.object;
  } catch {
    updatedContent = source.object;
  }

  const id = target?.id ?? uuid();
  const resource = createResource(updatedContent, {
    id,
    origin: {
      storage: 'cluster',
      context: currentContext,
    },
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
    await dispatch(updateResource({resourceIdentifier: target, text: source.text}));
    return result;
  }

  return createResource(source.object, {
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
    object: cloneDeep(rawResource),
    text: jsonToYaml(rawResource),
    storage: 'transient',
    origin: {},
    isClusterScoped: getResourceKindHandler(rawResource.kind)?.isNamespaced || false,
    ...overrides,
  };
}
