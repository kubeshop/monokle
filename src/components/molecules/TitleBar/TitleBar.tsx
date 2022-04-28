import React from 'react';

import {Button} from 'antd';

import {useAppDispatch} from '@redux/hooks';
import {toggleLeftMenu} from '@redux/reducers/ui';

import {MonoPaneTitle} from '@components/atoms';

import * as S from './styled';

interface IProps {
  title: string;
  closable?: boolean;
}

const TitleBar: React.FC<IProps> = props => {
  const {title, children, closable = false} = props;
  const dispatch = useAppDispatch();

  return (
    <S.TitleBarContainer>
      <MonoPaneTitle>
        <S.Container>{title}</S.Container>
        {children && <S.RightButtons>{children}</S.RightButtons>}
        {closable && (
          <Button id="pane-close" onClick={() => dispatch(toggleLeftMenu())} type="link" size="small">
            <S.ArrowIcon />
          </Button>
        )}
      </MonoPaneTitle>
    </S.TitleBarContainer>
  );
};

export default TitleBar;
