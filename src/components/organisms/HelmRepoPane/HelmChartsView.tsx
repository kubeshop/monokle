import {useCallback, useEffect, useRef} from 'react';

import {Form, Modal, Typography} from 'antd';
import {ColumnProps} from 'antd/lib/table';

import {RightOutlined, SearchOutlined} from '@ant-design/icons';

import {debounce} from 'lodash';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  setHelmPaneChartSearch,
  setHelmPaneMenuItem,
  setHelmPaneSelectedChart,
  toggleHelmPanSearchHub,
} from '@redux/reducers/ui';

import {sortChartsByName, useSearchHelmCharts} from '@hooks/useSearchHelmCharts';

import {addHelmRepoCommand} from '@utils/helm';
import {useMainPaneDimensions} from '@utils/hooks';

import {Icon} from '@monokle/components';
import {ChartInfo} from '@shared/models/ui';
import {openUrlInExternalBrowser, trackEvent} from '@shared/utils';
import {runCommandInMainThread} from '@shared/utils/commands';

import HelmChartDetails from './HelmChartDetails';

import * as S from './styled';

const CHART_NAME_REGEX = /^[a-z]([-a-z0-9]*[a-z0-9])?(\/[a-z]([-a-z0-9]*[a-z0-9])?)*$/gi;

const columns: ColumnProps<ChartInfo>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
    sorter: {
      compare: sortChartsByName,
      multiple: 3,
    },
    responsive: ['sm'],
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
    responsive: ['sm'],
  },
  {
    title: 'Version',
    dataIndex: 'version',
    key: 'version',
    responsive: ['sm'],
  },
  {
    title: 'App Version',
    dataIndex: 'app_version',
    key: 'app_version',
    responsive: ['sm'],
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

const SearchForm = ({onChangeSearchInputHandler}: {onChangeSearchInputHandler: (q: string) => void}) => {
  const [form] = Form.useForm();
  const initialValue = useAppSelector(state => state.ui.helmPane.chartSearchToken);

  const helmRepoSearch = Form.useWatch('searchToken', form);
  useEffect(() => {
    onChangeSearchInputHandler(helmRepoSearch);
  }, [helmRepoSearch, onChangeSearchInputHandler]);

  return (
    <Form form={form} layout="inline">
      <Form.Item
        name="searchToken"
        rules={[
          {
            pattern: CHART_NAME_REGEX,
            message: 'Invalid input. please type a valid helm chart name.',
          },
        ]}
        initialValue={initialValue}
      >
        <S.Input placeholder="Search for a Helm Chart" prefix={<SearchOutlined />} size="large" />
      </Form.Item>
    </Form>
  );
};

const HelmChartsTable = () => {
  const dispatch = useAppDispatch();
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);
  const helmRepoSearch = useAppSelector(state => state.ui.helmPane.chartSearchToken);
  const isHelmSearchHubIncluded = useAppSelector(state => state.ui.helmPane.isSearchHubIncluded);
  const selectedChart = useAppSelector(state => state.ui.helmPane.selectedChart);
  const {height} = useMainPaneDimensions();
  const terminalHeight = useAppSelector(state => state.ui.paneConfiguration.bottomPaneHeight);
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);

  const ref = useRef<HTMLDivElement>(null);

  const onItemClick = useCallback(
    (chart: ChartInfo) => {
      if (chart.isHubSearch) {
        Modal.confirm({
          title: 'This chart is not added to your local repository list yet. Do you want to add it?',
          onOk: async () => {
            if (chart.repository) {
              const result = await runCommandInMainThread(addHelmRepoCommand(chart.repository));
              if (result.stdout) {
                dispatch(setHelmPaneSelectedChart(chart));
                trackEvent('helm_repo/select');
              }
            }
          },
        });
      } else {
        dispatch(setHelmPaneSelectedChart(chart));
        trackEvent('helm_repo/select');
      }
    },
    [dispatch]
  );

  const {result, error, loading} = useSearchHelmCharts(helmRepoSearch, isHelmSearchHubIncluded);

  const searchResultCount = result.length;
  const debouncedSearchRef = useRef(
    debounce((search: string) => {
      dispatch(setHelmPaneChartSearch(search));
    }, 400)
  );

  const onChangeSearchInputHandler = useCallback((search: string) => {
    debouncedSearchRef.current(search);
  }, []);

  return (
    <>
      <div style={{display: 'flex', gap: 16, alignItems: 'center', height: 72}}>
        <SearchForm onChangeSearchInputHandler={onChangeSearchInputHandler} />
        <S.Checkbox checked={isHelmSearchHubIncluded} onChange={() => dispatch(toggleHelmPanSearchHub())}>
          {' '}
          Include Artifact Hub in search
        </S.Checkbox>
      </div>

      {error ? (
        <S.ErrorText>
          <Icon name="warning" style={{marginRight: 4}} />
          Error: {error.message} <Typography.Text>- Please check helm from </Typography.Text>
          <Typography.Link onClick={() => openUrlInExternalBrowser('https://helm.sh/docs/intro/install/')}>
            here
          </Typography.Link>
        </S.ErrorText>
      ) : (
        <Typography.Text style={{height: 'fit-content', marginBottom: 12}}>
          {searchResultCount} Helm Charts found. You can
          <Typography.Link onClick={() => dispatch(setHelmPaneMenuItem('manage-repositories'))}>
            &nbsp;add more Helm Charts repositories&nbsp;
          </Typography.Link>
          to extend your search.
        </Typography.Text>
      )}

      <div ref={ref} style={{overflow: 'hidden', flex: 1}}>
        <S.Table
          showSorterTooltip
          sticky
          rowKey="name"
          dataSource={result}
          columns={columns}
          sortDirections={['ascend', 'descend']}
          loading={loading}
          pagination={false}
          scroll={{y: height - 360 - (bottomSelection === 'terminal' ? terminalHeight : 0)}}
          rowClassName={(record: ChartInfo) =>
            record.name === selectedChart?.name ? 'row-selected' : record.isHubSearch ? 'hub-search' : ''
          }
          onRow={(record: ChartInfo) => ({
            onClick: () => onItemClick(record),
          })}
        />
      </div>
      {leftMenuSelection === 'helm' && selectedChart && <HelmChartDetails />}
    </>
  );
};

export default HelmChartsTable;
