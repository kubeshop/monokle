import * as k8s from '@kubernetes/client-node';

import {setup} from '@redux/cluster/service/kube-control';

import {cpuParser, memoryParser} from '@utils/unit-converter';

import {createKubeClient} from '@shared/utils/kubeclient';

export const getClusterUtilization = async (kubeconfig: string, context: string): Promise<NodeMetric[]> => {
  const setupResponse = await setup({context, kubeconfig});
  if (!setupResponse.success) throw new Error(setupResponse.code);
  const kc = createKubeClient(kubeconfig, context, setupResponse.port);

  const metricClient = new k8s.Metrics(kc); // No VoidAuth available - might need workaround.
  const k8sApiClient = kc.makeApiClient(k8s.CoreV1Api);
  k8sApiClient.setDefaultAuthentication(new k8s.VoidAuth());

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
