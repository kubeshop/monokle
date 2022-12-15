import {shell} from 'electron';

import React, {useCallback} from 'react';

import {Feature} from '@shared/models/features';

import * as S from './TutorialCard.styled';

type Props = {
  feature: Feature;
};

const TutorialCard: React.FC<Props> = ({feature}) => {
  const {id, icon, name, description, learnMoreUrl, callToAction} = feature;

  const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl), [learnMoreUrl]);

  return (
    <S.Card key={id}>
      <S.ElipseWrapper>
        <S.Icon component={icon} />
      </S.ElipseWrapper>
      <S.Name>{name}</S.Name>
      <S.Description>{description}</S.Description>
      <S.Span>
        <S.Button>{callToAction}</S.Button>
        <S.Link onClick={openLearnMore}>Learn more</S.Link>
      </S.Span>
    </S.Card>
  );
};

export default TutorialCard;
