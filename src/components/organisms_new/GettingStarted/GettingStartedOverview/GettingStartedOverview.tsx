import React from 'react';

import {EDIT, EXPLORE, PUBLISH, VALIDATE} from '@models/features';

import GettingStartedCard from './GettingStartedCard';
import * as S from './GettingStartedOverview.styled';

const GettingStartedOverview: React.FC = () => {
  return (
    <S.GettingStartedOverviewContainer>
      <S.GettingStartedTitle>Boost your GettingStarted powers!</S.GettingStartedTitle>

      <S.GettingStartedCards>
        <GettingStartedCard feature={EXPLORE} />
        <GettingStartedCard feature={EDIT} />
        <GettingStartedCard feature={VALIDATE} />
        <GettingStartedCard feature={PUBLISH} />
      </S.GettingStartedCards>
    </S.GettingStartedOverviewContainer>
  );
};

export default GettingStartedOverview;
