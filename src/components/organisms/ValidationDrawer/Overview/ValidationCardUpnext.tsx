import {shell} from 'electron';

import React, {useCallback} from 'react';

import {LET_US_KNOW_URL} from '@constants/constants';

import * as S from './ValidationCardUpnext.styled';

export const ValidationCardUpnext: React.FC = () => {
  const openLetUsKnow = useCallback(() => shell.openExternal(LET_US_KNOW_URL), []);

  return (
    <S.Card>
      <S.Icon />
      <S.Name>New tools coming up soon!</S.Name>
      <span>
        <S.Link onClick={openLetUsKnow}>Let us know your favorites</S.Link>
      </span>
    </S.Card>
  );
};
