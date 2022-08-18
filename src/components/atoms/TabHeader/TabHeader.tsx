import React from 'react';

import * as S from './TabHeader.styled';

interface TabHeaderProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const TabHeader = ({children, icon}: TabHeaderProps): JSX.Element => {
  return (
    <S.Wrapper>
      {icon && icon}
      {children}
    </S.Wrapper>
  );
};

export default TabHeader;
