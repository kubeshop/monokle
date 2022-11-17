import {shell} from 'electron';

import React, {useCallback} from 'react';

import {Feature} from '@monokle-desktop/shared/models';
import {trackEvent} from '@monokle-desktop/shared/utils/telemetry';

import * as S from './GettingStartedCard.styled';

type Props = {
  feature: Feature;
};

const GettingStartedCard: React.FC<Props> = ({feature}) => {
  const {id, icon, name, description, learnMoreUrl, callToAction} = feature;

  const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl), [learnMoreUrl]);

  const onCTAHandler = () => {
    trackEvent('GETTING_STARTED_PAGE_OPENED', {id});
  };

  return (
    <S.Card key={id}>
      <S.ElipseWrapper>
        <S.Icon name={icon} key={icon} />
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

export default GettingStartedCard;
