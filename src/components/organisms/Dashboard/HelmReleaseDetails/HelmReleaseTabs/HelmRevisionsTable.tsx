import {useCallback, useMemo} from 'react';
import {useAsync} from 'react-use';

import {Table as AntTable, Button, Tag, Typography} from 'antd';

import {DateTime} from 'luxon';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

import {Colors} from '@shared/styles';
import {
  getHelmReleaseManifestCommand,
  helmReleaseRevisionsCommand,
  runCommandInMainThread,
} from '@shared/utils/commands';

import {useHelmReleaseDiffContext} from '../HelmReleaseContext';

interface HelmRevision {
  revision: number;
  updated: string;
  status: string;
  chart: string;
  app_version: string;
  description: string;
}

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

const createTableColumns = (onDiffClickHandler: (release: HelmRevision) => void) => [
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
  {
    title: '',
    dataIndex: '',
    key: 'x',
    responsive: ['sm'],
    render: (value: any, record: HelmRevision) => (
      <HoverArea>
        <Button type="primary" onClick={() => onDiffClickHandler(record)}>
          Diff
        </Button>
      </HoverArea>
    ),
  },
];

const HelmRevisionsTable = () => {
  const release = useAppSelector(state => state.dashboard.helm.selectedHelmRelease!);
  const setHelmReleaseDiff = useHelmReleaseDiffContext()[1];

  const onDiffClickHandler = useCallback(
    async (revision: HelmRevision) => {
      setHelmReleaseDiff({
        open: true,
        leftCommand: getHelmReleaseManifestCommand({release: release.name, namespace: release.namespace}),
        rightCommand: getHelmReleaseManifestCommand({
          release: release.name,
          namespace: release.namespace,
          revision: revision.revision,
        }),
        okText: 'Ok',
        okHandler: () => {},
      });
    },
    [release, setHelmReleaseDiff]
  );

  const columns = useMemo(() => createTableColumns(onDiffClickHandler), [onDiffClickHandler]);
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
      <Typography.Text>Review this Chart updates history below.</Typography.Text>
      <Table sticky rowKey="revision" dataSource={value} columns={columns} pagination={false} loading={loading} />
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
`;

const HoverArea = styled.div.attrs({
  className: 'hover-area',
})`
  display: flex;
  align-items: center;
  visibility: hidden;
`;