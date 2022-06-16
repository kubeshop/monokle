import {useCallback} from 'react';

import {Button} from 'antd';

import {comparisonInspected, selectComparison} from '@redux/compare';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import * as S from './InspectionActionBar.styled';

export const InspectionActionBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const inspection = useAppSelector(state => state.compare.current.inspect);
  const comparison = useAppSelector(state => selectComparison(state.compare, inspection?.comparison));
  const typeLabel = inspection?.type === 'diff' ? 'diff' : 'content';
  const resourceName =
    inspection?.type === 'left'
      ? comparison?.left?.name
      : inspection?.type === 'right'
      ? comparison?.right?.name
      : comparison?.left?.name ?? comparison?.right?.name;

  const handleBack = useCallback(() => {
    dispatch(comparisonInspected());
  }, [dispatch]);

  return (
    <S.ActionBarDiv>
      <div>
        Resource {typeLabel}
        {resourceName ? ` for ${resourceName}` : ''}
      </div>

      <S.ActionBarRightDiv>
        <Button type="primary" onClick={handleBack}>
          Back
        </Button>
      </S.ActionBarRightDiv>
    </S.ActionBarDiv>
  );
};
