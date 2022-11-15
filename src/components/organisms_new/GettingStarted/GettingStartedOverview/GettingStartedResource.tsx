import {shell} from 'electron';

import React, {useCallback} from 'react';

import {ResourceLink} from '@monokle-desktop/shared/models';

import * as S from './GettingStartedResource.styled';

type Props = {
  resourceLink: ResourceLink;
};

const GettingStartedResource: React.FC<Props> = ({resourceLink}) => {
  const {id, name, description, learnMoreUrl} = resourceLink;

  const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl), [learnMoreUrl]);

  return (
    <S.ResourceLink key={id}>
      <span>
        <S.Link onClick={openLearnMore}>{name}</S.Link>
        <br />
        <S.Description>{description}</S.Description>
      </span>
    </S.ResourceLink>
  );
};

export default GettingStartedResource;
