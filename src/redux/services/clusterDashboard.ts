import * as k8s from '@kubernetes/client-node';

import {cpuParser, memoryParser} from '@utils/unit-converter';

export const getClusterUtilization = async (
  k8sApiClient: k8s.CoreV1Api,
  metricClient: k8s.Metrics
): Promise<NodeMetric[]> => {
  const nodeMetrics: k8s.NodeMetric[] = (await metricClient.getNodeMetrics()).items;
  const nodes = await k8s.topNodes(k8sApiClient);

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
