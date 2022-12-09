import React from 'react';

import {EDIT, EXPLORE, PUBLISH, VALIDATE} from '@shared/constants/features';
import {DISCORD, DOCUMENTATION, FEEDBACK, GUIDE, TUTORIAL, WHATSNEW} from '@shared/constants/tutorialReferences';

import TutorialCard from './TutorialCard';
import * as S from './TutorialPage.styled';
import TutorialReference from './TutorialReference';

const TutorialPage = () => {
  return (
    <S.TutorialPageContainer>
      <S.TutorialPageTitle>Starting with Monokle</S.TutorialPageTitle>
      <S.TutorialPageSubTitle>
        Select in which stage of the K8s manifests management you are in (or from which one you want to learn more
        about) and let us show you how Monokle can help you.
      </S.TutorialPageSubTitle>

      <S.TutorialCards>
        <TutorialCard feature={EXPLORE} />
        <S.Arrow />
        <TutorialCard feature={EDIT} />
        <S.Arrow />
        <TutorialCard feature={VALIDATE} />
        <S.Arrow />
        <TutorialCard feature={PUBLISH} />
      </S.TutorialCards>

      <S.TutorialPageTitle>Helpful Resources</S.TutorialPageTitle>
      <S.TutorialReferences>
        <TutorialReference tutorialReferenceLink={GUIDE} />
        <TutorialReference tutorialReferenceLink={TUTORIAL} />
        <TutorialReference tutorialReferenceLink={DOCUMENTATION} />
        <TutorialReference tutorialReferenceLink={DISCORD} />
        <TutorialReference tutorialReferenceLink={WHATSNEW} />
        <TutorialReference tutorialReferenceLink={FEEDBACK} />
      </S.TutorialReferences>
    </S.TutorialPageContainer>
  );
};

export default React.memo(TutorialPage);
