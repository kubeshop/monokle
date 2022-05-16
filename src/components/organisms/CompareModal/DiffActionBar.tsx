import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Button, Space, Switch} from 'antd';

import log from 'loglevel';

import {diffViewOpened, selectDiffedComparison} from '@redux/reducers/compare';

import {PartialStore} from './CompareModal';
import * as S from './DiffActionBar.styled';

export function DiffActionBar() {
  const dispatch = useDispatch();
  const diffComparison = useSelector((state: PartialStore) => selectDiffedComparison(state.compare));

  const handleBack = useCallback(() => {
    dispatch(diffViewOpened({id: undefined}));
  }, [dispatch]);

  const handleToggleHideIgnoredFields = useCallback(() => {
    log.debug('dispatch HideIgnoredFields');
  }, []);

  return (
    <S.ActionBarDiv>
      <div>Resource diff on {diffComparison?.left.name ?? 'unknown'}</div>

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
}
