import {useEffect, useState} from 'react';

import {ClusterEvent, getClusterEvents} from '@redux/services/clusterDashboard';
import {KubeConfigManager} from '@redux/services/kubeConfigManager';

import {TitleBar} from '@monokle/components';

import {Activity} from './Activity';
import * as S from './Dashboard.styled';
import {InventoryInfo, InventoryInfoData} from './InventoryInfo';

export const Dashboard = () => {
  const [inventoryData, setInventoryData] = useState<InventoryInfoData>({nodesCount: 0, podsCapacity: 0, podsCount: 0});
  const [activityData, setActivityData] = useState<ClusterEvent[]>([]);

  useEffect(() => {
    const k8sApiClient = new KubeConfigManager().getV1ApiClient();

    if (k8sApiClient) {
      // k8sApiClient.listNode().then(data => {
      //   console.log('data', data.body.items);
      //   setInventoryData({
      //     nodesCount: data.body.items.length,
      //     podsCapacity: data.body.items.reduce((sum, item) => sum + Number(item?.status?.capacity?.pods), 0),
      //     podsCount: 0,
      //   });
      // });

      getClusterEvents(k8sApiClient)
        .then(events => {
          setActivityData(events);
        })
        .catch(_error => [setActivityData([])]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [new KubeConfigManager().kubeConfig]);

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
          description={<p>Utilization</p>}
        />
      </S.TitleBarContainer>
      <S.TitleBarContainer style={{gridArea: 'inventory-info'}}>
        <TitleBar
          type="secondary"
          title="Inventory & Info"
          actions={<S.ActionWrapper>See all</S.ActionWrapper>}
          description={<InventoryInfo inventoryData={inventoryData} />}
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
