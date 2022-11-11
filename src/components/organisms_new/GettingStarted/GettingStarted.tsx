import React from 'react';

import GettingStartedOverview from '@organismsNew/GettingStarted/GettingStartedOverview';

import {usePaneHeight} from '@hooks/usePaneHeight';

import * as S from './GettingStarted.styled';

const GettingStarted = () => {
  const height = usePaneHeight();

  return (
    <S.GettingStartedContainer $height={height}>
      <GettingStartedOverview />
    </S.GettingStartedContainer>
  );
};

export default React.memo(GettingStarted);
