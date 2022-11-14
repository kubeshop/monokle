import {useEffect, useState} from 'react';
import {useInterval} from 'react-use';

import {
  ClusterEvent,
  ClusterInformation,
  NodeMetric,
  getClusterEvents,
  getClusterInformation,
  getClusterUtilization,
} from '@redux/services/clusterDashboard';
import {KubeConfigManager} from '@redux/services/kubeConfigManager';

import {TitleBar} from '@monokle/components';

import {Activity} from './Activity';
import * as S from './Dashboard.styled';
import {InventoryInfo} from './InventoryInfo';
import {Utilization} from './Utilization';

export const Dashboard = () => {
  const [clusterInformation, setClusterInformation] = useState<ClusterInformation | null>(null);
  const [activityData, setActivityData] = useState<ClusterEvent[]>([]);
  const [utilizationData, setUtilizationData] = useState<NodeMetric[]>([]);
  const [hearbeat, setHearbeat] = useState(0);

  useInterval(() => {
    setHearbeat(hearbeat + 1);
  }, 5000);

  useEffect(() => {
    const k8sApiClient = new KubeConfigManager().getV1ApiClient();
    const storageApiClient = new KubeConfigManager().getStorageApiClient();
    const metricClient = new KubeConfigManager().getMetricsClient();

    if (storageApiClient && k8sApiClient) {
      getClusterInformation(k8sApiClient, storageApiClient)
        .then(data => setClusterInformation(data))
        .catch(() => setClusterInformation(null));
    }

    if (k8sApiClient) {
      getClusterEvents(k8sApiClient)
        .then(events => {
          setActivityData(events);
        })
        .catch(() => setActivityData([]));
    }

    if (metricClient && k8sApiClient) {
      getClusterUtilization(k8sApiClient, metricClient)
        .then(data => setUtilizationData(data))
        .catch(() => setUtilizationData([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [new KubeConfigManager().kubeConfig, hearbeat]);

  return (
    <S.Container>
      <S.OverviewContainer style={{gridArea: 'overview'}}>
        <TitleBar type="secondary" title="Overview" actions={<span>Selection</span>} />
      </S.OverviewContainer>
      <S.TitleBarContainer style={{gridArea: 'status'}}>
        <TitleBar type="secondary" title="Status" description={<p>Status</p>} />
      </S.TitleBarContainer>
      <S.TitleBarContainer style={{gridArea: 'performance'}}>
        <TitleBar
          type="secondary"
          title="Performance"
          actions={<span>CPU Graph</span>}
          description={<p>Performance</p>}
        />
      </S.TitleBarContainer>
      <S.TitleBarContainer style={{gridArea: 'utilization'}}>
        <TitleBar
          type="secondary"
          title="Utilization"
          actions={<span>Default view</span>}
          description={<Utilization utilizations={utilizationData} />}
        />
      </S.TitleBarContainer>
      <S.TitleBarContainer style={{gridArea: 'inventory-info'}}>
        <TitleBar
          type="secondary"
          title="Inventory & Info"
          actions={<S.ActionWrapper>See all</S.ActionWrapper>}
          description={<InventoryInfo info={clusterInformation || ({} as ClusterInformation)} />}
        />
      </S.TitleBarContainer>
      <S.TitleBarContainer style={{gridArea: 'activity'}}>
        <TitleBar
          type="secondary"
          title="Activity"
          actions={
            <div>
              <S.ActionWrapper>See all</S.ActionWrapper>
            </div>
          }
          description={<Activity events={activityData} />}
        />
      </S.TitleBarContainer>
    </S.Container>
  );
};
