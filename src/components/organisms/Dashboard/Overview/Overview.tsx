import {useCallback, useEffect, useState} from 'react';
import {useInterval} from 'react-use';

import {ResourceKindHandler} from '@models/resourcekindhandler';

import {useAppSelector} from '@redux/hooks';
import {
  ClusterEvent,
  ClusterInformation,
  NodeMetric,
  getClusterEvents,
  getClusterInformation,
  getClusterUtilization,
} from '@redux/services/clusterDashboard';
import {KubeConfigManager} from '@redux/services/kubeConfigManager';

import PersistentVolumeClaimHandler from '@src/kindhandlers/PersistentVolumeClaim.handler';
import PodHandler from '@src/kindhandlers/Pod.handler';
import StorageClassHandler from '@src/kindhandlers/StorageClass.handler';

import {TitleBar} from '@monokle/components';

import {Activity} from '../Activity';
import {InventoryInfo} from '../InventoryInfo';
import {Utilization} from '../Utilization';
import * as S from './Overview.styled';

export const Overview = () => {
  const [clusterInformation, setClusterInformation] = useState<ClusterInformation | null>(null);
  const [activityData, setActivityData] = useState<ClusterEvent[]>([]);
  const [utilizationData, setUtilizationData] = useState<NodeMetric[]>([]);
  const [hearbeat, setHearbeat] = useState(0);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedNamespace = useAppSelector(state => state.ui.dashboard.selectedNamespace);

  useInterval(() => {
    setHearbeat(hearbeat + 1);
  }, 5000);

  const filterResource = useCallback(
    (kindHandler: ResourceKindHandler) => {
      return Object.values(resourceMap).filter(
        r => r.kind === kindHandler.kind && (selectedNamespace !== 'ALL' ? selectedNamespace === r.namespace : true)
      );
    },
    [resourceMap, selectedNamespace]
  );

  useEffect(() => {
    const k8sApiClient = new KubeConfigManager().getV1ApiClient();

    if (k8sApiClient) {
      getClusterInformation(
        k8sApiClient,
        filterResource(PodHandler),
        filterResource(StorageClassHandler),
        filterResource(PersistentVolumeClaimHandler)
      )
        .then(data => setClusterInformation(data))
        .catch(() => setClusterInformation(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [new KubeConfigManager().kubeConfig, resourceMap, filterResource]);

  useEffect(() => {
    const k8sApiClient = new KubeConfigManager().getV1ApiClient();

    if (k8sApiClient) {
      getClusterEvents(k8sApiClient, selectedNamespace === 'ALL' ? undefined : selectedNamespace)
        .then(events => {
          setActivityData(events);
        })
        .catch(() => setActivityData([]));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [new KubeConfigManager().kubeConfig, hearbeat, selectedNamespace]);

  useEffect(() => {
    const k8sApiClient = new KubeConfigManager().getV1ApiClient();
    const metricClient = new KubeConfigManager().getMetricsClient();
    if (metricClient && k8sApiClient) {
      getClusterUtilization(k8sApiClient, metricClient)
        .then(data => setUtilizationData(data))
        .catch(() => setUtilizationData([]));
    }
  }, [new KubeConfigManager().kubeConfig, hearbeat]);

  return (
    <S.Container>
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
