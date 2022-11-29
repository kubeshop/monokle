import {setActiveDashboardMenu, setSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch} from '@redux/hooks';
import {ClusterInformation} from '@redux/services/clusterDashboard';

import * as S from './InventoryInfo.styled';

export const InventoryInfo = ({info}: {info: ClusterInformation}) => {
  const dispatch = useAppDispatch();

  return (
    <S.Container>
      <S.NodesInformation>
        <S.NodesInformationRow
          onClick={() => {
            dispatch(setActiveDashboardMenu('Node'));
            dispatch(setSelectedResourceId());
          }}
        >
          {info.nodesCount || 0} Nodes
        </S.NodesInformationRow>
        <S.NodesInformationRow
          onClick={() => {
            dispatch(setActiveDashboardMenu('Pod'));
            dispatch(setSelectedResourceId());
          }}
        >
          <S.PodsCount>{info.podsCount || 0} Pods</S.PodsCount>
          <S.PercentageText> &#x2f; </S.PercentageText>
          <S.PercentageText>
            <S.PodsCapacity>{info.podsCapacity || 0}</S.PodsCapacity>
            <S.PodsUsagePercentage>
              ({((info.podsCount && info.podsCapacity ? info.podsCount / info.podsCapacity : 0) * 100).toFixed(2)})
            </S.PodsUsagePercentage>
          </S.PercentageText>
          <S.PercentageText>&#x25;</S.PercentageText>
        </S.NodesInformationRow>
        <S.NodesInformationRow
          onClick={() => {
            dispatch(setActiveDashboardMenu('StorageClass'));
            dispatch(setSelectedResourceId());
          }}
        >
          {info.storageClassCount || 0} StorageClasses
        </S.NodesInformationRow>
        <S.NodesInformationRow
          onClick={() => {
            dispatch(setActiveDashboardMenu('PersistentVolumeClaim'));
            dispatch(setSelectedResourceId());
          }}
        >
          {info.persistentVolumeClaimCount || 0} PersistentVolumeClaims
        </S.NodesInformationRow>
      </S.NodesInformation>
      <S.HorizontalLine />
      <S.ClusterAPIContainer>
        <S.Title>Cluster API address</S.Title>
        <S.Description>{info.clusterApiAddress || '-'}</S.Description>
      </S.ClusterAPIContainer>
      <S.HorizontalLine />
      <S.UsefulLinksContainer>
        <S.Title>Useful links</S.Title>
        <S.Link>Getting started</S.Link>
        <S.Link>Documentation</S.Link>
      </S.UsefulLinksContainer>
    </S.Container>
  );
};
