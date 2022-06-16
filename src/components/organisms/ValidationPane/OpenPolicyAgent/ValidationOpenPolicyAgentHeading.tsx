import {shell} from 'electron';

import React, {useCallback} from 'react';

import {OPA_INTEGRATION} from '@models/integrations';

import {useAppDispatch} from '@redux/hooks';
import {updateValidationIntegration} from '@redux/reducers/ui';

import * as S from './ValidationOpenPolicyAgentHeading.styled';

export const ValidationOpenPolicyAgentHeading: React.FC = () => {
  const {icon, name, learnMoreUrl} = OPA_INTEGRATION;
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
