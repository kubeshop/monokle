import {useCallback} from 'react';

import {Button, Space, Switch} from 'antd';

import log from 'loglevel';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {comparisonInspected, selectComparison} from '@redux/reducers/compare';

import * as S from './DiffActionBar.styled';

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

  const handleToggleHideIgnoredFields = useCallback(() => {
    log.debug('dispatch HideIgnoredFields');
  }, []);

  return (
    <S.ActionBarDiv>
      <div>
        Resource {typeLabel}
        {resourceName ? ` for ${resourceName}` : ''}
      </div>

      <S.ActionBarRightDiv>
        <Space size="middle">
          <Space size="small">
            <Switch onChange={handleToggleHideIgnoredFields} />
            <span>Hide ignored fields</span>
          </Space>

          <Button type="primary" onClick={handleBack}>
            Back
          </Button>
        </Space>
      </S.ActionBarRightDiv>
    </S.ActionBarDiv>
  );
};
