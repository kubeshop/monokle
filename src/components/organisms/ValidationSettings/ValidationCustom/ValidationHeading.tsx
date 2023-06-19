import {shell} from 'electron';

import {useCallback} from 'react';

import {Space} from 'antd';

import {useAppDispatch} from '@redux/hooks';
import {updateSelectedPluginConfiguration} from '@redux/validation/validation.slice';

import {Icon, IconNames} from '@monokle/components';

import * as S from './ValidationHeading.styled';

type IProps = {
  icon?: string;
  displayName: string;
  learnMoreUrl?: string;
};

const ValidationHeading: React.FC<IProps> = props => {
  const {icon, displayName, learnMoreUrl} = props;

  const dispatch = useAppDispatch();

  const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl || ''), [learnMoreUrl]);

  const onBackHandler = () => {
    dispatch(updateSelectedPluginConfiguration(undefined));
  };

  return (
    <S.Heading>
      <Space>
        <Icon name={(icon ?? 'kubernetes') as IconNames} style={{fontSize: '36px'}} />

        <S.HeadingTextContainer>
          <S.Name>{displayName}</S.Name>
          {learnMoreUrl && <S.Link onClick={openLearnMore}>Learn more</S.Link>}
        </S.HeadingTextContainer>
      </Space>

      <Space>
        <S.Button onClick={onBackHandler}>Back</S.Button>
      </Space>
    </S.Heading>
  );
};

export default ValidationHeading;
