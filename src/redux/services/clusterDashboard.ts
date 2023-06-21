import * as k8s from '@kubernetes/client-node';

import {uniq} from 'lodash';

import {createKubeClientWithSetup} from '@redux/cluster/service/kube-client';

import {cpuParser, memoryParser} from '@utils/unit-converter';

import {isDefined} from '@shared/utils/filter';
import {trackEvent} from '@shared/utils/telemetry';

let lastContext: string | undefined;

export const getClusterUtilization = async (kubeconfig: string, context: string): Promise<NodeMetric[]> => {
  const kc = await createKubeClientWithSetup({context, kubeconfig, skipHealthCheck: true});

  const metricClient = new k8s.Metrics(kc); // No VoidAuth available - might need workaround.
  const k8sApiClient = kc.makeApiClient(k8s.CoreV1Api);
  k8sApiClient.setDefaultAuthentication(new k8s.VoidAuth());

  const nodeMetrics: k8s.NodeMetric[] = (await metricClient.getNodeMetrics()).items;
  const nodes = await k8s.topNodes(k8sApiClient);
  let kubeletVersion: string | undefined;

  if (lastContext !== context) {
    const providers = uniq(
      nodes
        .map(node => {
          if (!kubeletVersion) {
            kubeletVersion = node.Node.status?.nodeInfo?.kubeletVersion;
          }

          const providerId = node.Node?.spec?.providerID;
          // ID of the node assigned by the cloud provider in the format: <ProviderName>://<ProviderSpecificNodeID>
          const providerParts = providerId?.split('://');
          if (providerParts?.length === 2) {
            return providerParts[0];
          }
          return undefined;
        })
        .filter(isDefined)
    );
    trackEvent('cluster/info', {providers, kubeletVersion});
  }

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
