import {useCallback, useEffect, useState} from 'react';
import {useInterval} from 'react-use';

import {Tooltip} from 'antd';

import {K8sResource} from '@models/k8sresource';

import {useAppSelector} from '@redux/hooks';
import {NodeMetric, getClusterUtilization} from '@redux/services/clusterDashboard';
import {KubeConfigManager} from '@redux/services/kubeConfigManager';

import {convertBytesToGigabyte, memoryParser} from '@utils/unit-converter';

import InfoCircle from '@assets/InfoCircle.svg';

import Colors from '@styles/Colors';

import * as S from './Utilization.styled';

export const Utilization = () => {
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedNamespace = useAppSelector(state => state.dashboard.ui.selectedNamespace);
  const [averageCpuUsage, setAverageCpuUsage] = useState(0);
  const [totalCpu, setTotalCpu] = useState(0);
  const [averageMemoryUsage, setAverageMemoryUsage] = useState(0);
  const [totalMemory, setTotalMemory] = useState(0);
  const [utilizationData, setUtilizationData] = useState<NodeMetric[]>([]);
  const [heartbeat, setHeartbeat] = useState(0);
  useInterval(() => {
    setHeartbeat(heartbeat + 1);
  }, 5000);

  useEffect(() => {
    const k8sApiClient = new KubeConfigManager().getV1ApiClient();
    const metricClient = new KubeConfigManager().getMetricsClient();
    if (metricClient && k8sApiClient) {
      getClusterUtilization(k8sApiClient, metricClient)
        .then(data => setUtilizationData(data))
        .catch(() => setUtilizationData([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [new KubeConfigManager().kubeConfig, heartbeat]);

  useEffect(() => {
    setTotalCpu(utilizationData.reduce((total, u) => u.cpuCapacity + total, 0));
    setAverageCpuUsage(utilizationData.reduce((total, u) => u.cpuUsage + total, 0));
    setTotalMemory(utilizationData.reduce((total, u) => u.memoryCapacity + total, 0));
    setAverageMemoryUsage(utilizationData.reduce((total, u) => u.memoryUsage + total, 0));
  }, [utilizationData]);

  const getTotalCapacity = useCallback(() => {
    return Object.values(resourceMap)
      .filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
      .filter((resource: K8sResource) => resource.content.apiVersion === 'v1' && resource.kind === 'Node')
      .reduce((total: number, node: K8sResource) => {
        if (node.content?.status?.capacity && node.content?.status?.capacity['ephemeral-storage']) {
          return total + memoryParser(node.content?.status?.capacity['ephemeral-storage']);
        }
        return total;
      }, 0);
  }, [resourceMap]);

  return (
    <S.Container>
      <S.Utilization>
        <S.ProgressContainer>
          <S.Progress
            strokeColor={Colors.geekblue7}
            percent={(averageCpuUsage / totalCpu) * 100}
            status="active"
            strokeWidth={20}
            showInfo={false}
            strokeLinecap="round"
          />
        </S.ProgressContainer>
        <S.InformationContainer>
          <S.InfoTitle>
            <span>CPU</span>
            <Tooltip title="some text">
              <S.InfoIcon src={InfoCircle} width={14} />
            </Tooltip>
          </S.InfoTitle>
          <S.InfoDescription>
            <span>{(averageCpuUsage / 1000).toFixed(2)}</span>
            <span> / </span>
            <span>{(totalCpu / 1000).toFixed(2)}</span>
          </S.InfoDescription>
        </S.InformationContainer>
      </S.Utilization>
      <S.Utilization>
        <S.ProgressContainer>
          <S.Progress
            strokeColor={Colors.geekblue7}
            percent={(averageMemoryUsage / totalMemory) * 100}
            status="active"
            strokeWidth={20}
            showInfo={false}
            strokeLinecap="round"
          />
        </S.ProgressContainer>
        <S.InformationContainer>
          <S.InfoTitle>
            <span>Memory</span>
            <Tooltip title="some text">
              <S.InfoIcon src={InfoCircle} width={14} />
            </Tooltip>
          </S.InfoTitle>
          <S.InfoDescription>
            <span>{convertBytesToGigabyte(averageMemoryUsage)}</span>
            <span> / </span>
            <span>{convertBytesToGigabyte(totalMemory)} GB</span>
          </S.InfoDescription>
        </S.InformationContainer>
      </S.Utilization>
      <S.Utilization>
        <S.ProgressContainer>
          <S.Progress
            strokeColor={Colors.geekblue7}
            percent={(0 / getTotalCapacity()) * 100}
            status="active"
            strokeWidth={20}
            showInfo={false}
            strokeLinecap="round"
          />
        </S.ProgressContainer>
        <S.InformationContainer>
          <S.InfoTitle>
            <span>Storage</span>
            <Tooltip title="some text">
              <S.InfoIcon src={InfoCircle} width={14} />
            </Tooltip>
          </S.InfoTitle>
          <S.InfoDescription>
            <span>{convertBytesToGigabyte(0)}</span>
            <span> / </span>
            <span>{convertBytesToGigabyte(getTotalCapacity())} GB</span>
          </S.InfoDescription>
        </S.InformationContainer>
      </S.Utilization>
    </S.Container>
  );
};
