import {shell} from 'electron';

import React, {useCallback} from 'react';

import {useAppDispatch} from '@redux/hooks';
import {updateSelectedPluginConfiguration} from '@redux/validation/validation.slice';

import {ValidationPlugin} from '@shared/models/validationPlugins';

import * as S from './ValidationPaneHeading.styled';

const ValidationPaneHeading: React.FC<{plugin: ValidationPlugin}> = ({plugin}) => {
  const {icon, name, learnMoreUrl} = plugin;
  const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl), [learnMoreUrl]);

  const dispatch = useAppDispatch();

  const onBackHandler = () => {
    dispatch(updateSelectedPluginConfiguration(undefined));
  };

  return (
    <S.Heading>
      <S.HeadingLeft>
        <S.Icon name={icon} />

        <S.HeadingTextContainer>
          <S.Name>{name}</S.Name>
          <S.Link onClick={openLearnMore}>Learn more</S.Link>
        </S.HeadingTextContainer>
      </S.HeadingLeft>

      <S.Button onClick={onBackHandler}>Back</S.Button>
    </S.Heading>
  );
};

export default ValidationPaneHeading;
