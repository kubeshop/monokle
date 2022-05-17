import {useCallback} from 'react';

import {Button, Checkbox, Divider, Input, Select, Space} from 'antd';

import log from 'loglevel';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  CompareOperation,
  comparisonAllToggled,
  operationUpdated,
  selectCompareStatus,
  selectIsAllComparisonSelected,
} from '@redux/reducers/compare';

import * as S from './CompareActionBar.styled';

export const CompareActionBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(state => selectCompareStatus(state.compare));
  const isAllSelected = useAppSelector(state => selectIsAllComparisonSelected(state.compare));
  const disabled = status === 'selecting';

  const handleSelectAll = useCallback(() => {
    dispatch(comparisonAllToggled());
  }, [dispatch]);

  const handleSaveView = useCallback(() => {
    log.debug('dispatch ViewSaved');
  }, []);

  const handleLoadView = useCallback(() => {
    log.debug('dispatch ViewLoaded');
  }, []);

  return (
    <S.ActionBarDiv>
      <div>
        <Checkbox disabled={disabled} checked={isAllSelected} onChange={handleSelectAll}>
          Select all
        </Checkbox>
      </div>

      <S.ActionBarRightDiv>
        <Space>
          <Input disabled={disabled} value="search" />

          <OperationSelect />

          <Divider type="vertical" style={{height: 28}} />

          <Button disabled={disabled} onClick={handleSaveView}>
            Save Diff
          </Button>

          <Button disabled={disabled} onClick={handleLoadView}>
            Load Diff
          </Button>
        </Space>
      </S.ActionBarRightDiv>
    </S.ActionBarDiv>
  );
};

function OperationSelect() {
  const dispatch = useAppDispatch();
  const currentOperation = useAppSelector(state => state.compare.current.view.operation);

  const handleSelect = useCallback(
    (operation: CompareOperation) => {
      dispatch(operationUpdated({operation}));
    },
    [dispatch]
  );

  return (
    <Select onChange={handleSelect} defaultValue="union" value={currentOperation} style={{width: '160px'}}>
      <Select.Option value="union">View all</Select.Option>
      <Select.Option value="intersection">Only matching</Select.Option>
      <Select.Option value="symmetricDifference">Only non-matching</Select.Option>
      <Select.Option value="leftJoin">View left join</Select.Option>
      <Select.Option value="rightJoin">View right join</Select.Option>
    </Select>
  );
}
