import {useCallback, useEffect, useRef} from 'react';

import {Button, Form, Modal, TableColumnProps, Typography} from 'antd';

import {RightOutlined, SearchOutlined} from '@ant-design/icons';

import {debounce} from 'lodash';

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
import {trackEvent} from '@shared/utils';

import * as S from './styled';

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
  {
    title: '',
    dataIndex: '',
    key: 'x',
    responsive: ['sm'],
    width: 40,

    render: () => (
      <S.HoverArea>
        <RightOutlined style={{fontSize: 14}} />
      </S.HoverArea>
    ),
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
        <S.Input placeholder="Refine your Chart search" prefix={<SearchOutlined />} />
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
      width="75vw"
    >
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
        <Typography.Text>{searchResultCount} Helm Charts available. Select desired one to proceed.</Typography.Text>
        <SearchForm onChangeSearchInputHandler={onChangeSearchInputHandler} />
      </div>
      <S.Table
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
