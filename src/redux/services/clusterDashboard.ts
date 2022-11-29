import * as k8s from '@kubernetes/client-node';

import _ from 'lodash';

import {PREVIEW_PREFIX} from '@constants/constants';

import {K8sResource} from '@models/k8sresource';

import {cpuParser, memoryParser} from '@utils/unit-converter';
import {jsonToYaml} from '@utils/yaml';

import {KubeConfigManager} from './kubeConfigManager';
import {extractK8sResources} from './resource';

// ADD to KindHandlers
export const getClusterEvents = async (k8sApiClient: k8s.CoreV1Api, namespace?: string): Promise<ClusterEvent[]> => {
  const events: k8s.CoreV1Event[] | undefined = namespace
    ? (await k8sApiClient?.listNamespacedEvent(namespace))?.body.items
    : (await k8sApiClient?.listEventForAllNamespaces())?.body.items;

  if (!events) {
    return [];
  }

  return _.sortBy(
    events.map((event: k8s.CoreV1Event) => ({
      type: event.type || 'Unspecified',
      message: event.message || '',
      reason: event.reason || '',
      source: {
        host: event.source?.host || '',
        component: event.source?.component || '',
      },
      metadata: {
        name: event.metadata?.name || '',
        namespace: event.metadata?.namespace || '',
        uid: event.metadata?.uid || '',
        creationTimestamp: event.metadata?.creationTimestamp || new Date(0),
      },
      lastTimestamp: event.lastTimestamp || new Date(0),
      involvedObject: event.involvedObject,
      count: event.count || NaN,
    })),
    'lastTimestamp'
  )
    .filter(i => Boolean(i.count) && Boolean(i.source.host))
    .reverse();
};

// ADD to KindHandlers
export const getNodes = async (k8sApiClient: k8s.CoreV1Api): Promise<K8sResource[]> => {
  try {
    const response = await k8sApiClient.listNode();
    let nodes: k8s.V1Node[] = response.body.items;

    nodes = nodes.map(n => ({...n, apiVersion: 'v1', kind: 'Node'}));

    const results = extractK8sResources(
      nodes.map(r => jsonToYaml(r)).join('\n---\n'),
      PREVIEW_PREFIX + new KubeConfigManager().getKubeConfig().currentContext
    );

    return results;
  } catch (error) {
    return [];
  }
};

export const getClusterUtilization = async (
  k8sApiClient: k8s.CoreV1Api,
  metricClient: k8s.Metrics
): Promise<NodeMetric[]> => {
  const nodeMetrics: k8s.NodeMetric[] = (await metricClient.getNodeMetrics()).items;
  const nodes = await k8s.topNodes(k8sApiClient);

  console.log('nodeMetrics', nodeMetrics);
  console.log('nodes', nodes);

  return nodeMetrics.map(m => ({
    nodeName: m.metadata.name,
    cpuUsage: cpuParser(m.usage.cpu),
    memoryUsage: memoryParser(m.usage.memory),
    cpuCapacity: cpuParser(
      nodes.find(n => n?.Node?.metadata?.name === m.metadata.name)?.Node.status?.capacity?.cpu || '0'
    ),
    memoryCapacity: memoryParser(
      nodes.find(n => n?.Node?.metadata?.name === m.metadata.name)?.Node.status?.capacity?.memory || '0'
    ),
    cpuLimitTotal: cpuParser(
      String(Number(nodes.find(n => n?.Node?.metadata?.name === m.metadata.name)?.CPU?.LimitTotal))
    ),
    cpuRequestTotal: cpuParser(
      String(Number(nodes.find(n => n?.Node?.metadata?.name === m.metadata.name)?.CPU?.RequestTotal))
    ),
    memoryLimitTotal: memoryParser(
      String(Number(nodes.find(n => n?.Node?.metadata?.name === m.metadata.name)?.Memory?.LimitTotal))
    ),
    memoryRequestTotal: memoryParser(
      String(Number(nodes.find(n => n?.Node?.metadata?.name === m.metadata.name)?.Memory?.RequestTotal))
    ),
  }));
};

export interface ClusterEvent {
  type: string;
  message: string;
  reason: string;
  source: {component: string; host: string};
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: Date;
  };
  lastTimestamp: Date;
  involvedObject: k8s.V1ObjectReference;
  count: number;
}

export interface NodeMetric {
  nodeName: string;
  cpuUsage: number;
  memoryUsage: number;
  cpuCapacity: number;
  memoryCapacity: number;
  cpuLimitTotal: number;
  cpuRequestTotal: number;
  memoryLimitTotal: number;
  memoryRequestTotal: number;
}
