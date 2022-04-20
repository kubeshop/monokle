import React from 'react';

import * as S from './ValidationOpenPolicyAgentHeading.styled';

type Props = {
  onBack: () => void;
};

export function ValidationOpenPolicyAgentHeading({onBack}: Props) {
  return (
    <S.Heading>
      <S.HeadingLeft>
        <S.Icon name="open-policy-agent" />

        <S.HeadingTextContainer>
          <S.Name>Open Policy Agent</S.Name>
          <S.Link>Learn more</S.Link>
        </S.HeadingTextContainer>
      </S.HeadingLeft>

      <S.Button onClick={onBack}>Back</S.Button>
    </S.Heading>
  );
}
