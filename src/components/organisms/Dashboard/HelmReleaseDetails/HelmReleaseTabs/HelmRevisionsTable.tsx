import {useAsync} from 'react-use';

import {Table as AntTable, Tag, Typography} from 'antd';

import {DateTime} from 'luxon';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

import {Colors} from '@shared/styles';
import {helmReleaseRevisionsCommand, runCommandInMainThread} from '@shared/utils/commands';

const getTagColor = (status: string) => {
  switch (status) {
    case 'deployed':
      return 'green';
    case 'superseded':
      return undefined;
    case 'failed':
      return 'red';
    case 'uninstalled':
      return 'grey';
    default:
      return undefined;
  }
};

const columns = [
  {
    title: 'Revision',
    dataIndex: 'revision',
  },
  {
    title: 'Updated',
    dataIndex: 'updated',
    render: (text: string) => {
      return DateTime.fromISO(text).toRelative();
    },
  },
  {
    title: 'Status',
    dataIndex: 'status',
    render: (value: string) => {
      return <Tag color={getTagColor(value)}>{value}</Tag>;
    },
  },
  {
    title: 'Chart',
    dataIndex: 'chart',
  },
  {
    title: 'App Version',
    dataIndex: 'app_version',
  },
  {
    title: 'Description',
    dataIndex: 'description',
  },
];

const HelmRevisionsTable = () => {
  const release = useAppSelector(state => state.ui.helmPane.selectedHelmRelease!);

  const {value, loading} = useAsync(async () => {
    const result = await runCommandInMainThread(
      helmReleaseRevisionsCommand({release: release.name, namespace: release.namespace!})
    );
    if (result.stderr) {
      throw new Error(result.stderr);
    }
    return JSON.parse(result.stdout || '[]').reverse();
  }, [release]);

  return (
    <>
      <Typography.Text>
        Review this Chart updates history below. You can also <Typography.Link>update </Typography.Link> to latest
        version.
      </Typography.Text>
      <Table rowKey="revision" dataSource={value} columns={columns} pagination={false} loading={loading} />
    </>
  );
};

export default HelmRevisionsTable;

export const Table = styled(props => <AntTable {...props} />)`
  .ant-table {
    border: 1px solid ${Colors.grey4};
    border-radius: 2px;
    margin-top: 30px;
  }

  .ant-table-header {
    background-color: #1f2628;
    color: ${Colors.grey9};
    font-size: 14px !important;
    font-weight: 700 !important;
    border-bottom: 1px solid ${Colors.grey4};
    margin-bottom: 0;
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
