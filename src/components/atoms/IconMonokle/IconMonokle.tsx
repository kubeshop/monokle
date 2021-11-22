import React from 'react';

import styled from 'styled-components';

import {useAppDispatch} from '@redux/hooks';
import {updateStartupModalVisible} from '@redux/reducers/appConfig';

import MonokleLogoDark from '@assets/MonokleLogoDark.svg';
import MonokleLogoLight from '@assets/MonokleLogoLight.svg';

export type IconMonokleProps = {
  useDarkTheme?: React.ReactNode;
};

const StyledImage = styled.img`
  height: 24px;
  margin: 4px;
  margin-top: 11px;
`;

const IconMonokle = (props: IconMonokleProps) => {
  const {useDarkTheme} = props;
  const dispatch = useAppDispatch();

  const showStartupModal = () => {
    dispatch(updateStartupModalVisible(true));
  };

  return (
    <>
      <StyledImage onClick={showStartupModal} src={useDarkTheme ? MonokleLogoDark : MonokleLogoLight} alt="Monokle" />
    </>
  );
};

export default IconMonokle;
