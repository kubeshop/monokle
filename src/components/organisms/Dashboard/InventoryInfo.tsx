import {ClusterInformation} from '@redux/services/clusterDashboard';

import * as S from './InventoryInfo.styled';

export const InventoryInfo = ({info}: {info: ClusterInformation}) => {
  return (
    <S.Container>
      <S.NodesInformation>
        <S.NodesInformationRow>{info.nodesCount} Nodes</S.NodesInformationRow>
        <S.NodesInformationRow>
          <span>{info.podsCount} Pods</span>
          <S.PercentageText> &#x2f; </S.PercentageText>
          <S.PercentageText>
            {info.podsCapacity} ({((info.podsCount / info.podsCapacity) * 100).toFixed(2)})
          </S.PercentageText>
          <S.PercentageText>&#x25;</S.PercentageText>
        </S.NodesInformationRow>
        <S.NodesInformationRow>{info.storageClassCount} Storage Classes</S.NodesInformationRow>
        <S.NodesInformationRow>{info.persistentVolumeClaimCount} Persistent Volume Claims</S.NodesInformationRow>
      </S.NodesInformation>
      <S.HorizontalLine />
      <div>
        <S.Title>Cluster API address</S.Title>
        <S.Description>{info.clusterApiAddress}</S.Description>
      </div>
      <S.HorizontalLine />
      <div>
        <S.Title>Useful links</S.Title>
        <S.Link>Getting started</S.Link>
        <S.Link>Documentation</S.Link>
      </div>
    </S.Container>
  );
};
