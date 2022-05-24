import {useCallback} from 'react';

import {Checkbox, Input, Select, Space} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  CompareOperation,
  comparisonAllToggled,
  filterUpdated,
  operationUpdated,
  searchUpdated,
  selectCompareStatus,
  selectIsAllComparisonSelected,
} from '@redux/reducers/compare';

import {Filter, FilterPopover} from '@components/molecules/FilterPopover';

import * as S from './CompareActionBar.styled';

export const CompareActionBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(state => selectCompareStatus(state.compare));
  const isAllSelected = useAppSelector(state => selectIsAllComparisonSelected(state.compare));
  const disabled = status !== 'comparing';
  const search = useAppSelector(state => state.compare.current.search);
  const filter = useAppSelector(state => state.compare.current.view.filter);

  const handleSelectAll = useCallback(() => {
    dispatch(comparisonAllToggled());
  }, [dispatch]);

  const handleSearch = useCallback(
    (newSearch: string) => {
      dispatch(searchUpdated({search: newSearch}));
    },
    [dispatch]
  );

  const handleFilterUpdated = useCallback(
    (newFilter: Filter | undefined) => {
      dispatch(filterUpdated({filter: newFilter}));
    },
    [dispatch]
  );

  return (
    <S.ActionBarDiv>
      <div>
        <Checkbox disabled={disabled} checked={isAllSelected} onChange={handleSelectAll}>
          Select all
        </Checkbox>
      </div>

      <S.ActionBarRightDiv>
        <Space>
          <Input
            disabled={disabled}
            prefix={<S.SearchIcon />}
            placeholder="Search"
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />

          <OperationSelect />

          <FilterPopover disabled={disabled} filter={filter} onChange={handleFilterUpdated} />
        </Space>
      </S.ActionBarRightDiv>
    </S.ActionBarDiv>
  );
};

function OperationSelect() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(state => selectCompareStatus(state.compare));
  const currentOperation = useAppSelector(state => state.compare.current.view.operation);

  const handleSelect = useCallback(
    (operation: CompareOperation) => {
      dispatch(operationUpdated({operation}));
    },
    [dispatch]
  );

  return (
    <Select
      disabled={status !== 'comparing'}
      onChange={handleSelect}
      defaultValue="union"
      value={currentOperation}
      style={{width: '160px'}}
    >
      <Select.Option value="union">View all</Select.Option>
      <Select.Option value="intersection">Only matching</Select.Option>
      <Select.Option value="symmetricDifference">Only non-matching</Select.Option>
      <Select.Option value="leftJoin">View left join</Select.Option>
      <Select.Option value="rightJoin">View right join</Select.Option>
    </Select>
  );
}
