import React from 'react';
import styled from 'styled-components';
import MonokleLogoLight from '@assets/MonokleLogoLight.svg';
import MonokleLogoDark from '@assets/MonokleLogoDark.svg';

export type IconMonokleProps = {
  useDarkTheme?: React.ReactNode;
};

const StyledImage = styled.img`
  height: 40px;
  padding: 5px;
  margin: 0px;
  margin-top: 2px;
`;

const IconMonokle = (props: IconMonokleProps) => {
  const {useDarkTheme} = props;

  return (
    <>
      <StyledImage src={useDarkTheme ? MonokleLogoDark : MonokleLogoLight} alt="Monokle" />
    </>
  );
};

export default IconMonokle;
