import React from 'react';

import {
  DISCORD,
  DOCUMENTATION,
  EDIT,
  EXPLORE,
  FEEDBACK,
  GUIDE,
  PUBLISH,
  TUTORIAL,
  VALIDATE,
  WHATSNEW,
} from '@monokle-desktop/shared/models';

import GettingStartedCard from './GettingStartedCard';
import * as S from './GettingStartedOverview.styled';
import GettingStartedResource from './GettingStartedResource';

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
        <GettingStartedCard feature={EDIT} />
        <GettingStartedCard feature={VALIDATE} />
        <GettingStartedCard feature={PUBLISH} />
      </S.GettingStartedCards>

      <S.GettingStartedTitle>Helpful Resources</S.GettingStartedTitle>
      <S.GettingStartedResources>
        <GettingStartedResource referenceLink={GUIDE} />
        <GettingStartedResource referenceLink={TUTORIAL} />
        <GettingStartedResource referenceLink={DOCUMENTATION} />
        <GettingStartedResource referenceLink={DISCORD} />
        <GettingStartedResource referenceLink={WHATSNEW} />
        <GettingStartedResource referenceLink={FEEDBACK} />
      </S.GettingStartedResources>
    </S.GettingStartedOverviewContainer>
  );
};

export default GettingStartedOverview;
