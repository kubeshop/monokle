import React from 'react';

import {MonoPaneTitle} from '@components/atoms';

import * as S from './styled';

interface IProps {
  title: string;
}

const TitleBar: React.FC<IProps> = props => {
  const {title, children} = props;

  return (
    <S.TitleBarContainer>
      <MonoPaneTitle>
        <S.Container>
          {title}
          {children && <S.RightButtons>{children}</S.RightButtons>}
        </S.Container>
      </MonoPaneTitle>
    </S.TitleBarContainer>
  );
};

export default TitleBar;
