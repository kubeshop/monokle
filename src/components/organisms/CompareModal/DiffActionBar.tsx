import {useCallback} from 'react';

import {Button, Space, Switch} from 'antd';

import log from 'loglevel';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {diffViewOpened, selectDiffedComparison} from '@redux/reducers/compare';

import * as S from './DiffActionBar.styled';

export const DiffActionBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const diffComparison = useAppSelector(state => selectDiffedComparison(state.compare));

  const handleBack = useCallback(() => {
    dispatch(diffViewOpened({id: undefined}));
  }, [dispatch]);

  const handleToggleHideIgnoredFields = useCallback(() => {
    log.debug('dispatch HideIgnoredFields');
  }, []);

  return (
    <S.ActionBarDiv>
      <div>Resource diff on {diffComparison?.left?.name ?? diffComparison?.right?.name ?? 'unknown'}</div>

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
