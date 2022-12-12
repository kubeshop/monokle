import {shell} from 'electron';

import React, {useCallback} from 'react';

import {Feature} from '@shared/models/features';
import {trackEvent} from '@shared/utils/telemetry';

import * as S from './TutorialCard.styled';

type Props = {
  feature: Feature;
};

const TutorialCard: React.FC<Props> = ({feature}) => {
  const {id, icon, name, description, learnMoreUrl, callToAction} = feature;

  const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl), [learnMoreUrl]);

  const onCTAHandler = () => {
    trackEvent('TUTORIAL_PAGE_OPENED', {id});
  };

  return (
    <S.Card key={id}>
      <S.ElipseWrapper>
        <S.Icon component={icon} />
      </S.ElipseWrapper>
      <S.Name>{name}</S.Name>
      <S.Description>{description}</S.Description>
      <S.Span>
        <S.Button onClick={onCTAHandler}>{callToAction}</S.Button>
        <S.Link onClick={openLearnMore}>Learn more</S.Link>
      </S.Span>
    </S.Card>
  );
};

export default TutorialCard;
