import {useCallback, useMemo, useState} from 'react';
import {useAsync, useMeasure} from 'react-use';

import {Button} from 'antd';

import {RightOutlined} from '@ant-design/icons';

import {useAppSelector} from '@redux/hooks';

import {runCommandInMainThread, searchHelmRepoCommand} from '@shared/utils/commands';

import HelmChartDetails from './HelmChartDetails';

import * as S from './styled';

interface TableDataType {
  name: string;
  description: string;
  version: string;
  app_version: string;
}

const createColumns = (onItemClick: (chartName: string) => void) => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
    sorter: true,
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
    sorter: true,
    responsive: ['lg'],
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

    render: (_text: string, record: TableDataType) => (
      <S.HoverArea>
        <Button type="primary" onClick={() => onItemClick(record.name)}>
          Details & Download
        </Button>
        <RightOutlined style={{fontSize: 14, marginLeft: 8}} />
      </S.HoverArea>
    ),
  },
];

const HelmRepoPane = () => {
  const helmRepoSearch = useAppSelector(state => state.ui.helmRepo.search);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [ref, {height: contentHeight}] = useMeasure<HTMLDivElement>();
  const onItemClick = useCallback((chart: string) => {
    setSelectedChart(chart);
  }, []);

  const columns = useMemo(() => {
    return createColumns(onItemClick);
  }, [onItemClick]);

  const {value: data = [], loading} = useAsync(async () => {
    const result = await runCommandInMainThread(searchHelmRepoCommand({q: helmRepoSearch}));
    if (result.stderr) {
      throw new Error(result.stderr);
    }
    return JSON.parse(result.stdout || '[]') as Array<TableDataType>;
  }, [helmRepoSearch]);

  const searchResultCount = data.length;

  return (
    <S.Container>
      <S.Header>
        <S.Title>{searchResultCount} Helm Charts found</S.Title>
      </S.Header>
      <div ref={ref} style={{height: '100%', overflow: 'hidden'}}>
        <S.Table
          showSorterTooltip
          sticky
          rowKey="name"
          dataSource={data}
          columns={columns}
          sortDirections={['ascend', 'descend']}
          loading={loading}
          pagination={false}
          scroll={{y: contentHeight - 56}}
        />
      </div>
      {selectedChart && <HelmChartDetails chart={selectedChart} onDismissPane={setSelectedChart} />}
    </S.Container>
  );
};

export default HelmRepoPane;
