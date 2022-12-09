import {shell} from 'electron';

import React, {useCallback} from 'react';

import {TutorialReferenceLink} from '@shared/models/tutorialReferences';

import * as S from './TutorialReference.styled';

type Props = {
  tutorialReferenceLink: TutorialReferenceLink;
};

const TutorialReference: React.FC<Props> = ({tutorialReferenceLink}) => {
  const {type, name, description, learnMoreUrl} = tutorialReferenceLink;

  const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl), [learnMoreUrl]);

  return (
    <S.TutorialReferenceLink key={type}>
      <span>
        <S.Link onClick={openLearnMore}>{name}</S.Link>
        <br />
        <S.Description>{description}</S.Description>
      </span>
    </S.TutorialReferenceLink>
  );
};

export default TutorialReference;
