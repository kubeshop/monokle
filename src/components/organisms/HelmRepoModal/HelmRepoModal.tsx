import {useCallback, useEffect, useRef} from 'react';

import {Table as AntTable, Button, Form, Input, Modal, TableColumnProps, Typography} from 'antd';

import {SearchOutlined} from '@ant-design/icons';

import {debounce} from 'lodash';
import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  closeHelmRepoModal,
  setHelmPaneChartSearch,
  setHelmPaneSelectedChart,
  setIsInQuickClusterMode,
  setLeftMenuSelection,
  toggleStartProjectPane,
} from '@redux/reducers/ui';

import {sortChartsByName, useSearchHelmCharts} from '@hooks/useSearchHelmCharts';

import {ChartInfo} from '@shared/models/ui';
import {Colors} from '@shared/styles';
import {trackEvent} from '@shared/utils';

const columns: TableColumnProps<ChartInfo>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
    sorter: {
      compare: sortChartsByName,
      multiple: 3,
    },
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
  {
    title: 'Version',
    dataIndex: 'version',
    key: 'version',
  },
  {
    title: 'App Version',
    dataIndex: 'app_version',
    key: 'app_version',
  },
];

const CHART_NAME_REGEX = /^[a-z]([-a-z0-9]*[a-z0-9])?(\/[a-z]([-a-z0-9]*[a-z0-9])?)*$/gi;

const SearchForm = ({onChangeSearchInputHandler}: {onChangeSearchInputHandler: (q: string) => void}) => {
  const [form] = Form.useForm();
  const initialValue = useAppSelector(state => state.ui.helmPane.chartSearchToken);

  const helmRepoSearch = Form.useWatch('searchToken', form);
  useEffect(() => {
    onChangeSearchInputHandler(helmRepoSearch);
  }, [helmRepoSearch, onChangeSearchInputHandler]);

  return (
    <Form form={form}>
      <Form.Item
        style={{marginBottom: 0}}
        name="searchToken"
        rules={[
          {
            pattern: CHART_NAME_REGEX,
            message: 'Invalid input. please type a valid helm chart name.',
          },
        ]}
        initialValue={initialValue}
      >
        <Input placeholder="Search for a Helm Chart" prefix={<SearchOutlined />} size="large" />
      </Form.Item>
    </Form>
  );
};

const HelmRepoModal = () => {
  const dispatch = useAppDispatch();
  const helmRepoSearch = useAppSelector(state => state.ui.helmPane.chartSearchToken);
  const {result, loading} = useSearchHelmCharts(helmRepoSearch, false);

  const searchResultCount = result.length;
  const debouncedSearchRef = useRef(
    debounce((search: string) => {
      dispatch(setHelmPaneChartSearch(search));
    }, 400)
  );

  const onChangeSearchInputHandler = useCallback((search: string) => {
    debouncedSearchRef.current(search);
  }, []);

  const onCancelClickHandler = () => {
    dispatch(closeHelmRepoModal());
  };

  const onItemClick = useCallback(
    (chart: ChartInfo) => {
      dispatch(setHelmPaneSelectedChart(chart));
      dispatch(closeHelmRepoModal());
      dispatch(setIsInQuickClusterMode(true));
      dispatch(setLeftMenuSelection('helm'));
      dispatch(toggleStartProjectPane());
      trackEvent('helm_repo/select');
    },
    [dispatch]
  );

  return (
    <Modal
      open
      title="Start from a Helm Chart"
      okText="Cancel"
      okType="default"
      footer={<Button onClick={onCancelClickHandler}>Cancel</Button>}
      width="60vw"
    >
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
        <Typography.Text>{searchResultCount} Helm Charts available. Select desired one to proceed.</Typography.Text>
        <SearchForm onChangeSearchInputHandler={onChangeSearchInputHandler} />
      </div>
      <Table
        columns={columns}
        dataSource={result}
        loading={loading}
        pagination={false}
        rowKey="name"
        scroll={{y: 300}}
        onRow={(record: ChartInfo) => ({
          onClick: () => onItemClick(record),
        })}
      />
    </Modal>
  );
};

export default HelmRepoModal;

const Table = styled(props => <AntTable {...props} />)`
  .ant-table {
    border: 1px solid ${Colors.grey4};
    border-radius: 2px;
  }

  .ant-table-header {
    background-color: #1f2628;
    color: ${Colors.grey9};
    font-size: 14px !important;
    font-weight: 700 !important;
    border-bottom: 1px solid ${Colors.grey4};
    margin-bottom: 0;
    scrollbar-gutter: stable both-edges;
  }

  & .ant-table-header .ant-table-cell {
    font-size: 14px;
    font-weight: 700;
    color: ${Colors.grey9};
  }

  .ant-table-thead .ant-table-cell::before {
    display: none;
  }

  .ant-table-body .ant-table-row {
    background-color: #191f21;
    border-bottom: 1px solid ${Colors.grey4};
    font-size: 14px;
    font-weight: 400;
    line-height: 18px;
    color: ${Colors.grey9};
  }

  .ant-table-body .ant-table-row:hover {
    background-color: #2a3437;
  }

  .ant-table-body .ant-table-row:hover .hover-area {
    visibility: visible;
  }

  .row-selected {
    background-color: ${Colors.cyan8} !important;
    color: ${Colors.grey2} !important;
  }

  .hub-search {
    color: ${Colors.geekblue8} !important;
  }
`;
