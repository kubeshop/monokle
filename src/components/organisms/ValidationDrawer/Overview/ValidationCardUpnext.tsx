import React from 'react';

import {LET_US_KNOW_URL} from '@constants/constants';

import {openUrlInExternalBrowser} from '@utils/shell';

import * as S from './ValidationCardUpnext.styled';

export const ValidationCardUpnext: React.FC = () => {
  return (
    <S.Card>
      <S.Icon />
      <S.Name>New tools coming up soon!</S.Name>
      <span>
        <S.Link onClick={() => openUrlInExternalBrowser(LET_US_KNOW_URL)}>Let us know your favorites</S.Link>
      </span>
    </S.Card>
  );
};
