import React from 'react';

import {TitleBar} from '@molecules';

import * as S from './ValidationPane.styled';

function ValidationPane() {
  return (
    <S.ValidationPaneContainer id="ValidationPane">
      <div>
        <TitleBar title="Validation" closable />
      </div>
    </S.ValidationPaneContainer>
  );
}

export default ValidationPane;
