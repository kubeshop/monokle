import React, {useCallback} from 'react';

import {useAppDispatch} from '@redux/hooks';
import {ComparisonView, compareToggled} from '@redux/reducers/compare';

import * as S from './styled';

export const QuickActionCompare = (props: {isItemSelected: boolean; view: ComparisonView}) => {
  const {isItemSelected, view} = props;

  const dispatch = useAppDispatch();
  const handleCompare = useCallback(() => {
    dispatch(
      compareToggled({
        value: true,
        initialView: view,
      })
    );
  }, [dispatch, view]);

  return (
    <S.Container>
      <S.PreviewSpan isItemSelected={isItemSelected} onClick={handleCompare}>
        Compare
      </S.PreviewSpan>
    </S.Container>
  );
};
