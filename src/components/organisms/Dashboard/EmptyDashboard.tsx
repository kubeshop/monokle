import {useAppSelector} from '@redux/hooks';
import {kubeConfigPathValidSelector} from '@redux/selectors';

import ClusterIndication from '@assets/ClusterIndication.svg';

import * as S from './EmptyDashboard.styled';

export const EmptyDashboard = () => {
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);

  return (
    <S.Container>
      <S.Text>
        {!isKubeConfigPathValid ? (
          'Start by connecting your cluster.'
        ) : (
          <>
            Click on <span>Connect</span> to load the resources from your cluster and watch for changes.
          </>
        )}
      </S.Text>

      <S.Image alt="Cluster Indication" src={ClusterIndication} />
    </S.Container>
  );
};
