import {useAsync} from 'react-use';

import {Table as AntTable} from 'antd';

import {DateTime} from 'luxon';
import styled from 'styled-components';

import {Colors} from '@shared/styles';
import {helmReleaseRevisionsCommand, runCommandInMainThread} from '@shared/utils/commands';

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
  const {value, loading} = useAsync(async () => {
    const result = await runCommandInMainThread(
      helmReleaseRevisionsCommand({release: 'ingress-nginx', namespace: 'n1'})
    );
    if (result.stderr) {
      throw new Error(result.stderr);
    }
    return JSON.parse(result.stdout || '[]');
  });
  return <Table rowKey="revision" dataSource={value} columns={columns} pagination={false} loading={loading} />;
};

export default HelmRevisionsTable;

export const Table = styled(props => <AntTable {...props} />)`
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
