import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Button, Space, Switch} from 'antd';

import styled from 'styled-components';

import {diffViewOpened, selectDiffedComparison} from '@redux/reducers/compare';

import {PartialStore} from './CompareModal';

const ActionBarDiv = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 12px;
  margin-bottom: 6px;
  border-radius: 2px;
  background-color: #31393c80;
`;

const ActionBarRightDiv = styled.div`
  display: flex;
  align-items: center;
`;

export function DiffActionBar() {
  const dispatch = useDispatch();
  const diffComparison = useSelector((state: PartialStore) => selectDiffedComparison(state.compare));

  const handleBack = useCallback(() => {
    dispatch(diffViewOpened({id: undefined}));
  }, [dispatch]);

  const handleToggleHideIgnoredFields = useCallback(() => {
    console.log('dispatch HideIgnoredFields');
  }, []);

  return (
    <ActionBarDiv>
      <div>Resource diff on {diffComparison?.left.name ?? 'unknown'}</div>

      <ActionBarRightDiv>
        <Space size="middle">
          <Space size="small">
            <Switch onChange={handleToggleHideIgnoredFields} />
            <span>Hide ignored fields</span>
          </Space>

          <Button type="primary" onClick={handleBack}>
            Back
          </Button>
        </Space>
      </ActionBarRightDiv>
    </ActionBarDiv>
  );
}
