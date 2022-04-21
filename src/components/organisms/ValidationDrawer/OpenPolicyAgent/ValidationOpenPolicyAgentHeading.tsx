import {shell} from 'electron';

import React, {useCallback} from 'react';

import {OPA_INTEGRATION} from '../integrations';
import * as S from './ValidationOpenPolicyAgentHeading.styled';

type Props = {
  onBack: () => void;
};

export function ValidationOpenPolicyAgentHeading({onBack}: Props) {
  const {icon, name, learnMoreUrl} = OPA_INTEGRATION;
  const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl), [learnMoreUrl]);

  return (
    <S.Heading>
      <S.HeadingLeft>
        <S.Icon name={icon} />

        <S.HeadingTextContainer>
          <S.Name>{name}</S.Name>
          <S.Link onClick={openLearnMore}>Learn more</S.Link>
        </S.HeadingTextContainer>
      </S.HeadingLeft>

      <S.Button onClick={onBack}>Back</S.Button>
    </S.Heading>
  );
}
