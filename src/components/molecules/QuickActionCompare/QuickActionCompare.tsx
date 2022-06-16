import React, {useCallback} from 'react';

import {ComparisonView, compareToggled} from '@redux/compare';
import {useAppDispatch} from '@redux/hooks';

import * as S from './styled';

type Props = {
  isItemSelected: boolean;
  from: 'quick-helm-compare' | 'quick-kustomize-compare';
  view: ComparisonView;
};

export const QuickActionCompare: React.FC<Props> = ({isItemSelected, from, view}) => {
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
