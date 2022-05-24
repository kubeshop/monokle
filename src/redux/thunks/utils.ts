import * as k8s from '@kubernetes/client-node';

import invariant from 'tiny-invariant';
import {stringify} from 'yaml';

import {PREVIEW_PREFIX, YAML_DOCUMENT_DELIMITER_NEW_LINE} from '@constants/constants';

import {AlertEnum} from '@models/alert';
import {ResourceMapType, ResourceRefsProcessingOptions} from '@models/appstate';
import {K8sResource, KubernetesObject} from '@models/k8sresource';
import {Policy} from '@models/policy';

import {extractK8sResources, processResources} from '@redux/services/resource';

import {createKubeClient} from '@utils/kubeclient';

import {getResourceKindHandler} from '@src/kindhandlers';

/**
 * Utility to convert list of objects returned by k8s api to a single YAML document
 */

export function getK8sObjectsAsYaml(items: any[], kind?: string, apiVersion?: string): string {
  return items
    .map(item => {
      delete item.metadata?.managedFields;

      if (kind && apiVersion && !item.apiVersion && !item.kind) {
        return `apiVersion: ${apiVersion}\nkind: ${kind}\n${stringify(item)}`;
      }

      return stringify(item);
    })
    .join(YAML_DOCUMENT_DELIMITER_NEW_LINE);
}

/**
 * Creates a preview result from a YAML string containing resources
 */

export function createPreviewResult(
  schemaVersion: string,
  userDataDir: string,
  resourcesYaml: string,
  previewResourceId: string,
  title: string,
  resourceRefsProcessingOptions: ResourceRefsProcessingOptions,
  previewKubeConfigPath?: string,
  previewKubeConfigContext?: string,
  processOptions?: {policyPlugins?: Policy[]}
) {
  const resources = extractK8sResources(resourcesYaml, PREVIEW_PREFIX + previewResourceId);
  const resourceMap = resources.reduce((rm: ResourceMapType, r) => {
    rm[r.id] = r;
    return rm;
  }, {});

  processResources(schemaVersion, userDataDir, resourceMap, resourceRefsProcessingOptions, processOptions);

  return {
    previewResourceId,
    previewResources: resourceMap,
    alert: {
      title,
      message: `Previewing ${Object.keys(resourceMap).length} resources`,
      type: AlertEnum.Success,
    },
    previewKubeConfigPath,
    previewKubeConfigContext,
  };
}

/**
 * Creates a thunk rejection that displays an error alert
 */

export function createRejectionWithAlert(thunkAPI: any, title: string, message: string) {
  return thunkAPI.rejectWithValue({
    alert: {
      title,
      message,
      type: AlertEnum.Error,
    },
  });
}

export async function getResourceFromCluster(
  resource: K8sResource,
  kubeconfigPath: string,
  context?: string
): Promise<KubernetesObject | undefined> {
  const resourceKindHandler = getResourceKindHandler(resource.kind);

  if (resource && resource.text && resourceKindHandler) {
    const kubeClient = createKubeClient(kubeconfigPath, context);
    const resourceFromCluster = await resourceKindHandler.getResourceFromCluster(kubeClient, resource);
    return toPojo(resourceFromCluster);
  }
}

export async function removeNamespaceFromCluster(namespace: string, kubeconfigPath: string, context?: string) {
  const kubeClient = createKubeClient(kubeconfigPath, context);
  const k8sCoreV1Api = kubeClient.makeApiClient(k8s.CoreV1Api);
  await k8sCoreV1Api.deleteNamespace(namespace);
}

type KubeClient = k8s.KubeConfig;

export async function getNamespace(client: KubeClient, name: string): Promise<KubernetesObject | undefined> {
  try {
    const api = client.makeApiClient(k8s.CoreV1Api);
    const resource = await api.readNamespace(name, 'true');
    return toPojo(resource.body);
  } catch {
    return undefined;
  }
}

export async function createNamespace(client: KubeClient, name: string): Promise<KubernetesObject> {
  const api = client.makeApiClient(k8s.CoreV1Api);
  const resource = await api.createNamespace({metadata: {name}}, 'true');
  return toPojoStrict(resource.body);
}

/**
 * Transforms the resource to a plain old JavaScript object.
 *
 * The Kubernetes client works with JavaScript classes.
 * These are incompatible with Redux because they are inserializable.
 */
function toPojo(resource: k8s.KubernetesObject | undefined): KubernetesObject | undefined {
  if (!resource) return undefined;
  return JSON.parse(JSON.stringify(resource));
}

function toPojoStrict(resource: k8s.KubernetesObject | undefined): KubernetesObject {
  invariant(resource, 'unexpected undefined resource');
  return JSON.parse(JSON.stringify(resource));
}
