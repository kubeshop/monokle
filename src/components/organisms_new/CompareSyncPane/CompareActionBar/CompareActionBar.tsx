import {useCallback, useMemo, useState} from 'react';
import {useDebounce} from 'react-use';

import {Select, Space} from 'antd';

import {DEFAULT_EDITOR_DEBOUNCE} from '@constants/constants';

import {
  comparisonAllToggled,
  filterUpdated,
  namespaceUpdated,
  operationUpdated,
  searchUpdated,
  selectCompareStatus,
  selectIsAllComparisonSelected,
  selectKnownNamespaces,
} from '@redux/compare';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {Filter, FilterPopover} from '@components/molecules/FilterPopover';

import * as S from './CompareActionBar.styled';

const CompareActionBar: React.FC = () => {
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
      <S.Checkbox disabled={disabled} checked={isAllSelected} onChange={handleSelectAll}>
        Select all
      </S.Checkbox>

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
      if (value === search) return;
      dispatch(searchUpdated({search: value}));
    },
    50,
    [value]
  );

  return (
    <S.SearchInput
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
      const newNamespace = value === '' ? undefined : value;
      if (newNamespace === namespace) return;
      dispatch(namespaceUpdated({namespace: newNamespace}));
    },
    DEFAULT_EDITOR_DEBOUNCE,
    [value]
  );

  return (
    <S.NamespaceInput
      placeholder="Set default namespace"
      disabled={disabled}
      value={value}
      options={options}
      onSearch={setValue}
    />
  );
}

function OperationSelect() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(state => selectCompareStatus(state.compare));
  const currentOperation = useAppSelector(state => state.compare.current.view.operation);

  return (
    <S.Select
      disabled={status !== 'comparing'}
      onChange={(value: any) => dispatch(operationUpdated({operation: value}))}
      defaultValue="union"
      value={currentOperation}
      style={{width: '160px'}}
    >
      <Select.Option value="union">View all</Select.Option>
      <Select.Option value="intersection">Only matching</Select.Option>
      <Select.Option value="symmetricDifference">Only non-matching</Select.Option>
      <Select.Option value="leftJoin">View left join</Select.Option>
      <Select.Option value="rightJoin">View right join</Select.Option>
    </S.Select>
  );
}

export default CompareActionBar;
