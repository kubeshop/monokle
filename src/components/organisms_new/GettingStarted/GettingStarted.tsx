import {useMemo} from 'react';

import {useAppSelector} from '@redux/hooks';

import GettingStartedOverview from '@organismsNew/GettingStarted/GettingStartedOverview';

import {usePaneHeight} from '@hooks/usePaneHeight';

import * as S from './GettingStarted.styled';

const GettingStarted = () => {
  const integration = useAppSelector(state => state.main.validationIntegration);
  const height = usePaneHeight();

  const Panel = useMemo(() => {
    return GettingStartedOverview;
  }, [integration]);

  return (
    <S.GettingStartedContainer $height={height}>
      <Panel />
    </S.GettingStartedContainer>
  );
};

export default GettingStarted;
