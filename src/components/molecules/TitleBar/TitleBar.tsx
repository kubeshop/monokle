import React from 'react';

import {MonoPaneTitle} from '@components/atoms';

import * as S from './styled';

function TitleBar(props: {title: string; children?: React.ReactNode}) {
  const {title, children} = props;
  return (
    <S.Container>
      <MonoPaneTitle>{title}</MonoPaneTitle>
      {children && <S.RightButtons>{children}</S.RightButtons>}
    </S.Container>
  );
}

export default TitleBar;
