import {useCallback, useMemo, useState} from 'react';
import {useAsync, useMeasure} from 'react-use';

import {Table as AntTable, Button, Typography} from 'antd';

import {RightOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

import {Colors} from '@shared/styles';
import {runCommandInMainThread, searchHelmRepoCommand} from '@shared/utils/commands';

import HelmChartDetails from './HelmChartDetails';

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
      <HoverArea>
        <Button type="primary" onClick={() => onItemClick(record.name)}>
          Details & Download
        </Button>
        <RightOutlined style={{fontSize: 14, marginLeft: 8}} />
      </HoverArea>
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
    <Container>
      <Header>
        <Title>{searchResultCount} Helm Charts found</Title>
      </Header>
      <div ref={ref} style={{height: '100%', overflow: 'hidden'}}>
        <Table
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
    </Container>
  );
};

export default HelmRepoPane;

const Container = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 56px 1fr;
  row-gap: 16px;
  padding: 12px 12px 12px 22px;
  overflow: hidden;
  height: 100%;
  place-content: start;
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  display: flex;
  background-color: ${Colors.grey3b};
  justify-content: space-between;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  border-radius: 4px;
`;

const Title = styled(Typography.Text)`
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
`;

const Table = styled(props => <AntTable {...props} />)`
  .ant-table {
    border: 1px solid ${Colors.grey4};
    border-radius: 2px;
  }

  .ant-table-header {
    background-color: ${Colors.grey2};
    color: ${Colors.grey9};
    text-transform: uppercase;
    font-size: 14px;
    font-weight: 700;
    border-bottom: 1px solid ${Colors.grey4};
    margin-bottom: 0;
  }

  .ant-table-thead .ant-table-cell::before {
    display: none;
  }

  .ant-table-body .ant-table-row {
    background-color: ${Colors.grey1};
    border-bottom: 1px solid ${Colors.grey4};
  }

  .ant-table-body .ant-table-row:hover {
    background-color: ${Colors.grey2};
  }

  .ant-table-body .ant-table-row:hover .hover-area {
    visibility: visible;
  }
`;

const HoverArea = styled.div.attrs({
  className: 'hover-area',
})`
  display: flex;
  align-items: center;
  visibility: hidden;
`;
