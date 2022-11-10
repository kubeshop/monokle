import {shell} from 'electron';

import React, {useCallback} from 'react';

import {Feature} from '@models/features';

import {useAppDispatch} from '@redux/hooks';
import {updateFeature} from '@redux/reducers/main';

import {trackEvent} from '@utils/telemetry';

import * as S from './GettingStartedCard.styled';

type Props = {
  feature: Feature;
};

const GettingStartedCard: React.FC<Props> = ({feature}) => {
  const {id, icon, name, description, learnMoreUrl, CTA} = feature;

  const dispatch = useAppDispatch();

  const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl), [learnMoreUrl]);

  const onCTAHandler = () => {
    trackEvent('GETTING_STARTED_PAGE_OPENED', {id});
    dispatch(updateFeature(feature));
  };

  return (
    <S.Card key={id}>
      <S.Icon name={icon} key={icon} />
      <S.Name>{name}</S.Name>
      <S.Description>{description}</S.Description>
      <S.Span>
        <S.Button onClick={onCTAHandler}>{CTA}</S.Button>
        <S.Link onClick={openLearnMore}>Learn more</S.Link>
      </S.Span>
    </S.Card>
  );
};

export default GettingStartedCard;
