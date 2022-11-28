import {useAppSelector} from '@redux/hooks';
import {kubeConfigPathValidSelector} from '@redux/selectors';

import ConnectClusterDashboard from '@assets/ConnectClusterDashboard.svg';
import LoadClusterDashboard from '@assets/LoadClusterDashboard.svg';

import * as S from './EmptyDashboard.styled';

export const EmptyDashboard = () => {
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);

  return (
    <S.Container>
      <S.Image
        $right={isKubeConfigPathValid ? 108 : 132}
        src={isKubeConfigPathValid ? LoadClusterDashboard : ConnectClusterDashboard}
      />
    </S.Container>
  );
};
