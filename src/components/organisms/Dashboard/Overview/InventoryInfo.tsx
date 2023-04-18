import {useCallback} from 'react';

import {CLUSTER_DASHBOARD_HELP_URL} from '@constants/constants';

import {setActiveDashboardMenu, setDashboardSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch} from '@redux/hooks';
import {useResourceContentMap} from '@redux/selectors/resourceMapSelectors';
import {KubeConfigManager} from '@redux/services/kubeConfigManager';

import CustomResourceDefinitionHandler from '@src/kindhandlers/CustomResourceDefinition.handler';
import NamespaceHandler from '@src/kindhandlers/Namespace.handler';
import NodeHandler from '@src/kindhandlers/NodeHandler';
import PersistentVolumeClaimHandler from '@src/kindhandlers/PersistentVolumeClaim.handler';
import PodHandler from '@src/kindhandlers/Pod.handler';
import StorageClassHandler from '@src/kindhandlers/StorageClass.handler';

import {ResourceKindHandler} from '@shared/models/resourceKindHandler';
import {openDocumentation, openUrlInExternalBrowser} from '@shared/utils';

import * as S from './InventoryInfo.styled';

export const InventoryInfo = () => {
  const dispatch = useAppDispatch();
  const clusterResourceContentMap = useResourceContentMap('cluster');

  const filterResources = useCallback(
    (kind: string, apiVersion?: string) => {
      return Object.values(clusterResourceContentMap).filter(
        resourceContent =>
          (apiVersion ? resourceContent.object.apiVersion === apiVersion : true) && resourceContent.object.kind === kind
      );
    },
    [clusterResourceContentMap]
  );

  const getNodes = useCallback(() => {
    return Object.values(clusterResourceContentMap).filter(
      resource => resource.object.apiVersion === 'v1' && resource.object.kind === 'Node'
    );
  }, [clusterResourceContentMap]);

  const podsCapacity = useCallback(() => {
    return getNodes().reduce((total, node) => total + Number(node.object.status?.capacity?.pods), 0);
  }, [getNodes]);

  const setActiveMenu = (kindHandler: ResourceKindHandler) => {
    dispatch(
      setActiveDashboardMenu({
        key: `${kindHandler.clusterApiVersion}-${kindHandler.kind}`,
        label: kindHandler.kind,
      })
    );
    dispatch(setDashboardSelectedResourceId());
  };

  return (
    <S.Container>
      <S.NodesInformation>
        <S.NodesInformationRow onClick={() => setActiveMenu(NodeHandler)}>
          {getNodes().length || 0} Nodes
        </S.NodesInformationRow>
        <S.NodesInformationRow onClick={() => setActiveMenu(NamespaceHandler)}>
          {filterResources(NamespaceHandler.kind, NamespaceHandler.clusterApiVersion).length || 0} Namespaces
        </S.NodesInformationRow>
        <S.NodesInformationRow onClick={() => setActiveMenu(PodHandler)}>
          <S.PodsCount>{filterResources(PodHandler.kind, PodHandler.clusterApiVersion).length || 0} Pods</S.PodsCount>
          <S.PercentageText> &#x2f; </S.PercentageText>
          <S.PercentageText>
            <S.PodsCapacity>{podsCapacity() || 0}</S.PodsCapacity>
            <S.PodsUsagePercentage>
              (
              {(
                (filterResources(PodHandler.kind, PodHandler.clusterApiVersion) && podsCapacity()
                  ? filterResources(PodHandler.kind, PodHandler.clusterApiVersion).length / podsCapacity()
                  : 0) * 100
              ).toFixed(2)}
              )
            </S.PodsUsagePercentage>
          </S.PercentageText>
          <S.PercentageText>&#x25;</S.PercentageText>
        </S.NodesInformationRow>
        <S.NodesInformationRow onClick={() => setActiveMenu(CustomResourceDefinitionHandler)}>
          <span>
            {filterResources(CustomResourceDefinitionHandler.kind, CustomResourceDefinitionHandler.clusterApiVersion)
              .length || 0}
          </span>
          <span> CustomResourceDefinitions</span>
        </S.NodesInformationRow>
        <S.NodesInformationRow onClick={() => setActiveMenu(StorageClassHandler)}>
          {filterResources(StorageClassHandler.kind, StorageClassHandler.clusterApiVersion).length || 0} StorageClasses
        </S.NodesInformationRow>
        <S.NodesInformationRow onClick={() => setActiveMenu(PersistentVolumeClaimHandler)}>
          <span>
            {filterResources(PersistentVolumeClaimHandler.kind, PersistentVolumeClaimHandler.clusterApiVersion)
              .length || 0}
          </span>
          <span> PersistentVolumeClaims</span>
        </S.NodesInformationRow>
      </S.NodesInformation>
      <S.HorizontalLine />
      <S.ClusterInfoContainer>
        <S.ClusterInfoRow>
          <S.Title>Cluster API address</S.Title>
          <S.Description>{new KubeConfigManager().getV1ApiClient()?.basePath || '-'}</S.Description>
        </S.ClusterInfoRow>
        <S.ClusterInfoRow>
          <S.Title>Kubernetes Version</S.Title>
          <S.Description>{getNodes()[0]?.object?.status?.nodeInfo?.kubeletVersion || '-'}</S.Description>
        </S.ClusterInfoRow>
        <S.ClusterInfoRow>
          <S.Title>Container Runtime</S.Title>
          <S.Description>{getNodes()[0]?.object?.status?.nodeInfo?.containerRuntimeVersion || '-'}</S.Description>
        </S.ClusterInfoRow>
      </S.ClusterInfoContainer>
      <S.HorizontalLine />
      <S.UsefulLinksContainer>
        <S.Title>Documentation links</S.Title>
        <S.Link>
          <span onClick={() => openUrlInExternalBrowser(CLUSTER_DASHBOARD_HELP_URL)}>Cluster Dashboard</span>
        </S.Link>
        <S.Link>
          <span onClick={() => openDocumentation()}>Monokle Getting Started</span>
        </S.Link>
      </S.UsefulLinksContainer>
    </S.Container>
  );
};
