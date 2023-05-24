import {useCallback, useRef, useState} from 'react';
import {useAsync} from 'react-use';

import {Typography} from 'antd';

import {RightOutlined, SearchOutlined} from '@ant-design/icons';

import {debounce} from 'lodash';

import {useAppSelector} from '@redux/hooks';

import {useMainPaneDimensions} from '@utils/hooks';

import {runCommandInMainThread, searchHelmRepoCommand} from '@shared/utils/commands';

import HelmChartDetails from './HelmChartDetails/HelmChartDetails';

import * as S from './styled';

interface TableDataType {
  name: string;
  description: string;
  version: string;
  app_version: string;
}

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
    sorter: true,
    responsive: ['sm'],
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
    sorter: true,
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

const HelmChartsTable = () => {
  const [helmRepoSearch, setHelmRepoSearch] = useState('');
  const {height} = useMainPaneDimensions();
  const terminalHeight = useAppSelector(state => state.ui.paneConfiguration.bottomPaneHeight);
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);

  const ref = useRef<HTMLDivElement>(null);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const onItemClick = useCallback((chart: string) => {
    setSelectedChart(chart);
  }, []);

  const {value: data = [], loading} = useAsync(async () => {
    const result = await runCommandInMainThread(searchHelmRepoCommand({q: helmRepoSearch}));
    if (result.stderr) {
      throw new Error(result.stderr);
    }
    return JSON.parse(result.stdout || '[]') as Array<TableDataType>;
  }, [helmRepoSearch]);

  const searchResultCount = data.length;

  const onChangeSearchInputHandler = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setHelmRepoSearch(e.target.value);
  });

  return (
    <>
      <S.Input
        placeholder="Search for a Helm Chart"
        prefix={<SearchOutlined />}
        onChange={onChangeSearchInputHandler}
      />
      <Typography.Text style={{height: 'fit-content', marginBottom: 12}}>
        {searchResultCount} Helm Charts found. You can
        <Typography.Link> add more Helm Charts repositories</Typography.Link> to extend your search.
      </Typography.Text>
      <div ref={ref} style={{overflow: 'hidden', flex: 1}}>
        <S.Table
          showSorterTooltip
          sticky
          rowKey="name"
          dataSource={data}
          columns={columns}
          sortDirections={['ascend', 'descend']}
          loading={loading}
          pagination={false}
          scroll={{y: height - 360 - (bottomSelection === 'terminal' ? terminalHeight : 0)}}
          rowClassName={(record: TableDataType) => (record.name === selectedChart ? 'row-selected' : '')}
          onRow={(record: TableDataType) => ({
            onClick: () => onItemClick(record.name),
          })}
        />
      </div>
      {selectedChart && <HelmChartDetails chart={selectedChart} onDismissPane={setSelectedChart} />}
    </>
  );
};

export default HelmChartsTable;
