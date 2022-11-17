import React from 'react';

import {EDIT, EXPLORE, PUBLISH, VALIDATE} from '@monokle-desktop/shared/constants/features';
import {
  DISCORD,
  DOCUMENTATION,
  FEEDBACK,
  GUIDE,
  TUTORIAL,
  WHATSNEW,
} from '@monokle-desktop/shared/constants/referenceLinks';

import GettingStartedCard from './GettingStartedCard';
import * as S from './GettingStartedOverview.styled';
import GettingStartedReference from './GettingStartedReference';

const GettingStartedOverview: React.FC = () => {
  return (
    <S.GettingStartedOverviewContainer>
      <S.GettingStartedTitle>Starting with Monokle</S.GettingStartedTitle>
      <S.GettingStartedSubTitle>
        Select in which stage of the K8s manifests management you are in (or from which one you want to learn more
        about) and let us show you how Monokle can help you.
      </S.GettingStartedSubTitle>

      <S.GettingStartedCards>
        <GettingStartedCard feature={EXPLORE} />
        <S.Arrow />
        <GettingStartedCard feature={EDIT} />
        <S.Arrow />
        <GettingStartedCard feature={VALIDATE} />
        <S.Arrow />
        <GettingStartedCard feature={PUBLISH} />
        <S.Arrow />
      </S.GettingStartedCards>

      <S.GettingStartedTitle>Helpful Resources</S.GettingStartedTitle>
      <S.GettingStartedReferences>
        <GettingStartedReference referenceLink={GUIDE} />
        <GettingStartedReference referenceLink={TUTORIAL} />
        <GettingStartedReference referenceLink={DOCUMENTATION} />
        <GettingStartedReference referenceLink={DISCORD} />
        <GettingStartedReference referenceLink={WHATSNEW} />
        <GettingStartedReference referenceLink={FEEDBACK} />
      </S.GettingStartedReferences>
    </S.GettingStartedOverviewContainer>
  );
};

export default GettingStartedOverview;
