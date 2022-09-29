import {shell} from 'electron';

import React, {useCallback} from 'react';

import {ValidationIntegration} from '@models/integrations';

import {useAppDispatch} from '@redux/hooks';
import {updateValidationIntegration} from '@redux/reducers/main';

import * as S from './ValidationPaneHeading.styled';

const ValidationPaneHeading: React.FC<{integration: ValidationIntegration}> = props => {
  const {icon, name, learnMoreUrl} = props.integration;
  const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl), [learnMoreUrl]);

  const dispatch = useAppDispatch();

  const onBackHandler = () => {
    dispatch(updateValidationIntegration(undefined));
  };

  return (
    <S.Heading>
      <S.HeadingLeft>
        <S.Icon name={icon} />

        <S.HeadingTextContainer>
          <S.Name>{name}</S.Name>
          <S.Link onClick={openLearnMore}>Learn more</S.Link>
        </S.HeadingTextContainer>
      </S.HeadingLeft>

      <S.Button onClick={onBackHandler}>Back</S.Button>
    </S.Heading>
  );
};

export default ValidationPaneHeading;
