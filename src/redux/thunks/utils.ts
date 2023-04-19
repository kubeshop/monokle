import * as k8s from '@kubernetes/client-node';

import invariant from 'tiny-invariant';
import {stringify} from 'yaml';

import {YAML_DOCUMENT_DELIMITER_NEW_LINE} from '@constants/constants';

import {stringifyK8sResource} from '@utils/yaml';

import {getResourceKindHandler} from '@src/kindhandlers';

import {AlertEnum} from '@shared/models/alert';
import {K8sObject} from '@shared/models/k8s';
import {ResourceMeta} from '@shared/models/k8sResource';
import {createKubeClient} from '@shared/utils/kubeclient';

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

      return stringifyK8sResource(item);
    })
    .join(YAML_DOCUMENT_DELIMITER_NEW_LINE);
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
  resourceMeta: ResourceMeta,
  kubeconfigPath: string,
  context?: string
): Promise<K8sObject | undefined> {
  const resourceKindHandler = getResourceKindHandler(resourceMeta.kind);

  if (resourceKindHandler) {
    const kubeClient = createKubeClient(kubeconfigPath, context);
    const resourceFromCluster = await resourceKindHandler.getResourceFromCluster(kubeClient, resourceMeta);
    return toPojo(resourceFromCluster.body);
  }
}

export async function removeNamespaceFromCluster(namespace: string, kubeconfigPath: string, context?: string) {
  const kubeClient = createKubeClient(kubeconfigPath, context);
  const k8sCoreV1Api = kubeClient.makeApiClient(k8s.CoreV1Api);
  await k8sCoreV1Api.deleteNamespace(namespace);
}

type KubeClient = k8s.KubeConfig;

export async function getNamespace(client: KubeClient, name: string): Promise<K8sObject | undefined> {
  try {
    const api = client.makeApiClient(k8s.CoreV1Api);
    const resource = await api.readNamespace(name, 'true');
    return toPojo(resource.body);
  } catch {
    return undefined;
  }
}

export async function createNamespace(client: KubeClient, name: string): Promise<K8sObject> {
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
function toPojo(resource: k8s.KubernetesObject | undefined): K8sObject | undefined {
  if (!resource) return undefined;
  return JSON.parse(JSON.stringify(resource));
}

function toPojoStrict(resource: k8s.KubernetesObject | undefined): K8sObject {
  invariant(resource, 'unexpected undefined resource');
  return JSON.parse(JSON.stringify(resource));
}
