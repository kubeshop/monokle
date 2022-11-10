import React from 'react';

import {EDIT, EXPLORE, PUBLISH, VALIDATE} from '@models/features';
import {DISCORD, DOCUMENTATION, FEEDBACK, GUIDE, TUTORIAL, WHATSNEW} from '@models/resources';

import GettingStartedCard from './GettingStartedCard';
import * as S from './GettingStartedOverview.styled';
import GettingStartedResouce from './GettingStartedResource';

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
        <GettingStartedResouce resourceLink={GUIDE} />
        <GettingStartedResouce resourceLink={TUTORIAL} />
        <GettingStartedResouce resourceLink={DOCUMENTATION} />
        <GettingStartedResouce resourceLink={DISCORD} />
        <GettingStartedResouce resourceLink={WHATSNEW} />
        <GettingStartedResouce resourceLink={FEEDBACK} />
      </S.GettingStartedResources>
    </S.GettingStartedOverviewContainer>
  );
};

export default GettingStartedOverview;
