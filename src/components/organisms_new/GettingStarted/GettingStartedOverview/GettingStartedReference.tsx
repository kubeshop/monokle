import {shell} from 'electron';

import React, {useCallback} from 'react';

import {ReferenceLink} from '@monokle-desktop/shared/models';

import * as S from './GettingStartedReference.styled';

type Props = {
  referenceLink: ReferenceLink;
};

const GettingStartedReference: React.FC<Props> = ({referenceLink}) => {
  const {id, name, description, learnMoreUrl} = referenceLink;

  const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl), [learnMoreUrl]);

  return (
    <S.ReferenceLink key={id}>
      <span>
        <S.Link onClick={openLearnMore}>{name}</S.Link>
        <br />
        <S.Description>{description}</S.Description>
      </span>
    </S.ReferenceLink>
  );
};

export default GettingStartedReference;
