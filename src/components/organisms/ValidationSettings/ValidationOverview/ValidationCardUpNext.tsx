import React from 'react';

import {LET_US_KNOW_URL} from '@constants/constants';

import {openUrlInExternalBrowser} from '@shared/utils/shell';

import * as S from './ValidationCardUpNext.styled';

const ValidationCardUpNext: React.FC = () => {
  return (
    <S.Card>
      <S.Icon />
      <S.Name>New Validation Policies coming up soon!</S.Name>
      <span>
        <S.Link onClick={() => openUrlInExternalBrowser(LET_US_KNOW_URL)}>Let us know your favorites</S.Link>.
      </span>
    </S.Card>
  );
};

export default ValidationCardUpNext;
