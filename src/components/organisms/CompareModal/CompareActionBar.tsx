import {useCallback, useMemo, useState} from 'react';
import {useDebounce} from 'react-use';

import {AutoComplete, Checkbox, Input, Select, Space} from 'antd';

import {DEFAULT_EDITOR_DEBOUNCE} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  CompareOperation,
  comparisonAllToggled,
  filterUpdated,
  namespaceUpdated,
  operationUpdated,
  searchUpdated,
  selectCompareStatus,
  selectIsAllComparisonSelected,
  selectKnownNamespaces,
} from '@redux/reducers/compare';

import {Filter, FilterPopover} from '@components/molecules/FilterPopover';

import * as S from './CompareActionBar.styled';

export const CompareActionBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(state => selectCompareStatus(state.compare));
  const isAllSelected = useAppSelector(state => selectIsAllComparisonSelected(state.compare));
  const disabled = status !== 'comparing';
  const filter = useAppSelector(state => state.compare.current.view.filter);

  const handleSelectAll = useCallback(() => {
    dispatch(comparisonAllToggled());
  }, [dispatch]);

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
          <SearchInput disabled={disabled} />

          <NamespaceInput disabled={disabled} />

          <OperationSelect />

          <FilterPopover disabled={disabled} filter={filter} onChange={handleFilterUpdated} />
        </Space>
      </S.ActionBarRightDiv>
    </S.ActionBarDiv>
  );
};

function SearchInput({disabled}: {disabled: boolean}) {
  const dispatch = useAppDispatch();
  const search = useAppSelector(state => state.compare.current.search);
  const [value, setValue] = useState(search);

  useDebounce(
    () => {
      dispatch(searchUpdated({search: value}));
    },
    50,
    [value]
  );

  return (
    <Input
      disabled={disabled}
      prefix={<S.SearchIcon />}
      placeholder="Search"
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
}

function NamespaceInput({disabled}: {disabled: boolean}) {
  const dispatch = useAppDispatch();
  const knownNamespaces = useAppSelector(state => selectKnownNamespaces(state.compare));
  const options = useMemo(() => knownNamespaces.map(n => ({value: n})), [knownNamespaces]);

  const namespace = useAppSelector(state => state.compare.current.view.namespace);
  const [value, setValue] = useState(namespace);

  useDebounce(
    () => {
      if (value === '') {
        dispatch(namespaceUpdated({namespace: undefined}));
      } else {
        dispatch(namespaceUpdated({namespace: value}));
      }
    },
    DEFAULT_EDITOR_DEBOUNCE,
    [value]
  );

  return (
    <AutoComplete
      style={{width: 175}}
      placeholder="Set default namespace"
      disabled={disabled}
      value={value}
      options={options}
      onChange={setValue}
    />
  );
}

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
