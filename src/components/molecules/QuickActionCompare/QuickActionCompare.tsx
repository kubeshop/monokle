import React, {useCallback} from 'react';

import {ComparisonView, compareToggled} from '@redux/compare';
import {useAppDispatch} from '@redux/hooks';

import * as S from './QuickActionCompare.styled';

interface IProps {
  from: 'quick-helm-compare' | 'quick-kustomize-compare';
  isItemSelected: boolean;
  view: ComparisonView;
}

const QuickActionCompare: React.FC<IProps> = props => {
  const {from, isItemSelected, view} = props;

  const dispatch = useAppDispatch();

  const handleCompare = useCallback(() => {
    dispatch(
      compareToggled({
        from,
        value: true,
        initialView: view,
      })
    );
  }, [dispatch, from, view]);

  return (
    <S.Container>
      <S.PreviewSpan isItemSelected={isItemSelected} onClick={handleCompare}>
        Compare
      </S.PreviewSpan>
    </S.Container>
  );
};

export default QuickActionCompare;
