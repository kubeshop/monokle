import {useCallback} from 'react';

import {K8sResource} from '@models/k8sresource';

import {setActiveDashboardMenu, setSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {ClusterInformation} from '@redux/services/clusterDashboard';

import CustomResourceDefinitionHandler from '@src/kindhandlers/CustomResourceDefinition.handler';
import NamespaceHandler from '@src/kindhandlers/Namespace.handler';
import PersistentVolumeClaimHandler from '@src/kindhandlers/PersistentVolumeClaim.handler';
import PodHandler from '@src/kindhandlers/Pod.handler';
import StorageClassHandler from '@src/kindhandlers/StorageClass.handler';

import * as S from './InventoryInfo.styled';

export const InventoryInfo = ({info}: {info: ClusterInformation}) => {
  const dispatch = useAppDispatch();
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedNamespace = useAppSelector(state => state.dashboard.ui.selectedNamespace);

  const filterResources = useCallback(
    (kind: string, apiVersion?: string) => {
      return Object.values(resourceMap).filter(
        (resource: K8sResource) =>
          (apiVersion ? resource.content.apiVersion === apiVersion : true) &&
          resource.kind === kind &&
          (selectedNamespace !== 'ALL' ? selectedNamespace === resource.namespace : true)
      );
    },
    [resourceMap, selectedNamespace]
  );

  const setActiveMenu = (section: string) => {
    dispatch(setActiveDashboardMenu(section));
    dispatch(setSelectedResourceId());
  };

  return (
    <S.Container>
      <S.NodesInformation>
        <S.NodesInformationRow onClick={() => setActiveMenu('Node')}>
          {filterResources('Node', 'v1').length || 0} Nodes
        </S.NodesInformationRow>
        <S.NodesInformationRow onClick={() => setActiveMenu(NamespaceHandler.kind)}>
          {filterResources(NamespaceHandler.kind, NamespaceHandler.clusterApiVersion).length || 0} Namespaces
        </S.NodesInformationRow>
        <S.NodesInformationRow onClick={() => setActiveMenu(PodHandler.kind)}>
          <S.PodsCount>{filterResources(PodHandler.kind, PodHandler.clusterApiVersion).length || 0} Pods</S.PodsCount>
          <S.PercentageText> &#x2f; </S.PercentageText>
          <S.PercentageText>
            <S.PodsCapacity>{info.podsCapacity || 0}</S.PodsCapacity>
            <S.PodsUsagePercentage>
              ({((info.podsCount && info.podsCapacity ? info.podsCount / info.podsCapacity : 0) * 100).toFixed(2)})
            </S.PodsUsagePercentage>
          </S.PercentageText>
          <S.PercentageText>&#x25;</S.PercentageText>
        </S.NodesInformationRow>
        <S.NodesInformationRow onClick={() => setActiveMenu(CustomResourceDefinitionHandler.kind)}>
          <span>
            {filterResources(CustomResourceDefinitionHandler.kind, CustomResourceDefinitionHandler.clusterApiVersion)
              .length || 0}
          </span>
          <span> CustomResourceDefinitions</span>
        </S.NodesInformationRow>
        <S.NodesInformationRow onClick={() => setActiveMenu(StorageClassHandler.kind)}>
          {filterResources(StorageClassHandler.kind, StorageClassHandler.clusterApiVersion).length || 0} StorageClasses
        </S.NodesInformationRow>
        <S.NodesInformationRow onClick={() => setActiveMenu(PersistentVolumeClaimHandler.kind)}>
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
          <S.Description>{info.clusterApiAddress || '-'}</S.Description>
        </S.ClusterInfoRow>
        <S.ClusterInfoRow>
          <S.Title>K8s Version</S.Title>
          <S.Description>
            {filterResources('Node', 'v1')[0]?.content?.status?.nodeInfo?.kubeletVersion || '-'}
          </S.Description>
        </S.ClusterInfoRow>
        <S.ClusterInfoRow>
          <S.Title>Container Runtime</S.Title>
          <S.Description>
            {filterResources('Node', 'v1')[0]?.content?.status?.nodeInfo?.containerRuntimeVersion || '-'}
          </S.Description>
        </S.ClusterInfoRow>
      </S.ClusterInfoContainer>
      <S.HorizontalLine />
      <S.UsefulLinksContainer>
        <S.Title>Useful links</S.Title>
        <S.Link>Getting started</S.Link>
        <S.Link>Documentation</S.Link>
      </S.UsefulLinksContainer>
    </S.Container>
  );
};
