import React, {forwardRef, useCallback} from 'react';

import {DownCircleOutlined, UpCircleOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {toggleExpandActionsPaneFooter} from '@redux/reducers/ui';

import * as S from './ActionsPaneFooter.styled';

const ActionsPaneFooter = forwardRef((props, ref: React.ForwardedRef<HTMLDivElement>) => {
  const dispatch = useAppDispatch();
  const isExpanded = useAppSelector(state => state.ui.isActionsPaneFooterExpanded);

  const toggleIsExpanded = useCallback(() => dispatch(toggleExpandActionsPaneFooter()), [dispatch]);

  return (
    <S.Container ref={ref}>
      <S.TitleBar>
        <S.TitleLabel>Terminal</S.TitleLabel>
        <S.TitleIcon onClick={toggleIsExpanded}>
          {isExpanded ? <DownCircleOutlined /> : <UpCircleOutlined />}
        </S.TitleIcon>
      </S.TitleBar>

      {isExpanded && <S.Pane>Terminal in here</S.Pane>}
    </S.Container>
  );
});

export default ActionsPaneFooter;
