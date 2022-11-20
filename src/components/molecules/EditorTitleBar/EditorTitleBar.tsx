import React from 'react';

import {Button} from 'antd';

import {useAppDispatch} from '@redux/hooks';
import {toggleLeftMenu} from '@redux/reducers/ui';

import {EditorMonoPaneTitle} from '@atoms';

import * as S from './EditorTitleBar.styled';

interface IProps {
  title: string;
  leftButtons?: React.ReactNode;
  closable?: boolean;
  children?: React.ReactNode;
}

const EditorTitleBar: React.FC<IProps> = props => {
  const {title, leftButtons, children, closable = false} = props;
  const dispatch = useAppDispatch();

  return (
    <S.TitleBarContainer>
      <EditorMonoPaneTitle>
        <S.Container>
          {title}
          {leftButtons && <div style={{marginLeft: '10px', height: '24px'}}>{leftButtons}</div>}
        </S.Container>

        {children && <S.RightButtons>{children}</S.RightButtons>}

        {closable && (
          <Button id="pane-close" onClick={() => dispatch(toggleLeftMenu())} type="link" size="small">
            <S.ArrowIcon />
          </Button>
        )}
      </EditorMonoPaneTitle>
    </S.TitleBarContainer>
  );
};

export default EditorTitleBar;
