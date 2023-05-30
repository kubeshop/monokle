import {Dispatch, SetStateAction, useCallback, useRef, useState} from 'react';

import {Modal, Typography} from 'antd';
import {ColumnProps} from 'antd/lib/table';

import {RightOutlined, SearchOutlined} from '@ant-design/icons';

import {debounce} from 'lodash';

import {useAppSelector} from '@redux/hooks';

import {useSearchHelmCharts} from '@hooks/useSearchHelmCharts';
import type {ChartInfo} from '@hooks/useSearchHelmCharts';

import {useMainPaneDimensions} from '@utils/hooks';

import {openUrlInExternalBrowser, trackEvent} from '@shared/utils';
import {addHelmRepoCommand, runCommandInMainThread} from '@shared/utils/commands';

import HelmChartDetails from './HelmChartDetails';

import * as S from './styled';

const columns: ColumnProps<ChartInfo>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
    sorter: {
      compare: (a: ChartInfo, b: ChartInfo) => a.name.localeCompare(b.name),
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

const HelmChartsTable = ({
  setSelectedMenuItem,
}: {
  setSelectedMenuItem: Dispatch<SetStateAction<'browse-charts' | 'manage-repositories'>>;
}) => {
  const [helmRepoSearch, setHelmRepoSearch] = useState('');
  const [includeHubSearch, setIncludeHubSearch] = useState(false);
  const {height} = useMainPaneDimensions();
  const terminalHeight = useAppSelector(state => state.ui.paneConfiguration.bottomPaneHeight);
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);

  const ref = useRef<HTMLDivElement>(null);
  const [selectedChart, setSelectedChart] = useState<ChartInfo | null>(null);
  const onItemClick = useCallback(
    (chart: ChartInfo) => {
      if (chart.isHubSearch) {
        Modal.confirm({
          title: 'This chart is not added to your local repository list yet. Do you want to add it?',
          onOk: async () => {
            if (chart.repository) {
              const result = await runCommandInMainThread(addHelmRepoCommand(chart.repository));
              if (result.stdout) {
                setSelectedChart(chart);
                trackEvent('helm_repo/select');
              }
            }
          },
        });
      } else {
        setSelectedChart(chart);
        trackEvent('helm_repo/select');
      }
    },
    [setSelectedChart]
  );

  const {result, error, loading} = useSearchHelmCharts(helmRepoSearch, includeHubSearch);

  const searchResultCount = result.length;

  const onChangeSearchInputHandler = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setHelmRepoSearch(e.target.value);
  }, 400);

  return (
    <>
      {error ? (
        <S.ErrorText>
          Helm not found - please install it from{' '}
          <Typography.Link onClick={() => openUrlInExternalBrowser('https://helm.sh/docs/intro/install/')}>
            here
          </Typography.Link>
        </S.ErrorText>
      ) : (
        <>
          <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
            <S.Input
              placeholder="Search for a Helm Chart"
              prefix={<SearchOutlined />}
              onChange={onChangeSearchInputHandler}
              size="large"
            />
            <S.Checkbox onChange={check => setIncludeHubSearch(check.target.checked)}>
              {' '}
              Include Artifacthub in search
            </S.Checkbox>
          </div>
          <Typography.Text style={{height: 'fit-content', marginBottom: 12}}>
            {searchResultCount} Helm Charts found. You can
            <Typography.Link onClick={() => setSelectedMenuItem('manage-repositories')}>
              &nbsp;add more Helm Charts repositories&nbsp;
            </Typography.Link>
            to extend your search.
          </Typography.Text>
        </>
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
      {selectedChart && <HelmChartDetails chart={selectedChart.name} onDismissPane={setSelectedChart} />}
    </>
  );
};

export default HelmChartsTable;
