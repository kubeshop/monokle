import {useCallback, useEffect, useState} from 'react';
import {useInterval} from 'react-use';

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

import {TitleBarWrapper} from '@components/atoms/StyledComponents/TitleBarWrapper';

import PersistentVolumeClaimHandler from '@src/kindhandlers/PersistentVolumeClaim.handler';
import PodHandler from '@src/kindhandlers/Pod.handler';
import StorageClassHandler from '@src/kindhandlers/StorageClass.handler';

import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

import {Activity} from './Activity';
import {InventoryInfo} from './InventoryInfo';
import * as S from './Overview.styled';
import {Status} from './Status';
import {Utilization} from './Utilization';

export const Overview = () => {
  const [clusterInformation, setClusterInformation] = useState<ClusterInformation | null>(null);
  const [activityData, setActivityData] = useState<ClusterEvent[]>([]);
  const [utilizationData, setUtilizationData] = useState<NodeMetric[]>([]);
  const [heartbeat, setHeartbeat] = useState(0);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedNamespace = useAppSelector(state => state.dashboard.ui.selectedNamespace);

  useInterval(() => {
    setHeartbeat(heartbeat + 1);
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
  }, [new KubeConfigManager().kubeConfig, heartbeat, selectedNamespace]);

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

  return (
    <S.Container>
      <S.TitleBarContainer style={{gridArea: 'status'}}>
        <TitleBarWrapper type="secondary" title="Status" description={<Status />} />
      </S.TitleBarContainer>
      <S.TitleBarContainer style={{gridArea: 'performance'}}>
        <TitleBarWrapper type="secondary" title="Performance" description={<></>} />
      </S.TitleBarContainer>
      <S.TitleBarContainer style={{gridArea: 'utilization'}}>
        <TitleBarWrapper
          type="secondary"
          title="Utilization"
          actions={
            <S.ActionWrapper>
              <span>Default view</span>
              <S.DownOutlined />
            </S.ActionWrapper>
          }
          description={<Utilization utilizations={utilizationData} />}
        />
      </S.TitleBarContainer>
      <S.TitleBarContainer style={{gridArea: 'inventory-info'}}>
        <TitleBarWrapper
          type="secondary"
          title="Inventory & Info"
          actions={<S.ActionWrapper>See all</S.ActionWrapper>}
          description={<InventoryInfo info={clusterInformation || ({} as ClusterInformation)} />}
        />
      </S.TitleBarContainer>
      <S.TitleBarContainer style={{gridArea: 'activity'}}>
        <TitleBarWrapper
          type="secondary"
          title="Activity"
          actions={
            <div>
              <S.ActionWrapper style={{marginRight: '8px'}}>
                <S.PauseCircleFilled />
                <span>Pause</span>
              </S.ActionWrapper>
              <S.ActionWrapper>See all</S.ActionWrapper>
            </div>
          }
          description={<Activity events={activityData} />}
        />
      </S.TitleBarContainer>
    </S.Container>
  );
};
