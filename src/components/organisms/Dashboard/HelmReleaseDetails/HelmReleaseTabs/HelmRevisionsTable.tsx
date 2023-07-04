import {useCallback, useMemo} from 'react';
import {useAsync} from 'react-use';

import {Table as AntTable, Button, Modal, Tag, Tooltip, Typography} from 'antd';

import {DateTime} from 'luxon';
import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';

import {errorAlert, successAlert} from '@utils/alert';
import {useMainPaneDimensions} from '@utils/hooks';

import {HelmRelease} from '@shared/models/ui';
import {Colors} from '@shared/styles';
import {trackEvent} from '@shared/utils';
import {
  getHelmReleaseManifestCommand,
  helmReleaseRevisionsCommand,
  rollbackHelmReleaseCommand,
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

const createTableColumns = (release: HelmRelease, onDiffClickHandler: (release: HelmRevision) => void) => [
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

    ellipsis: true,
  },
  {
    title: '',
    dataIndex: '',
    key: 'x',
    fixed: 'right',
    width: 150,
    render: (value: any, record: HelmRevision) => {
      const isSameRevision = Number(record.revision) === Number(release.revision);
      return (
        <HoverArea>
          <Tooltip title={isSameRevision ? 'Cannot Rollback to the same version' : 'Rollback'}>
            <Button disabled={isSameRevision} type="primary" onClick={() => onDiffClickHandler(record)}>
              Rollback
            </Button>
          </Tooltip>
        </HoverArea>
      );
    },
  },
];

const HelmRevisionsTable = () => {
  const {height} = useMainPaneDimensions();

  const dispatch = useAppDispatch();
  const release = useAppSelector(state => state.dashboard.helm.selectedHelmRelease!);
  const setHelmReleaseDiff = useHelmReleaseDiffContext()[1];
  const terminalHeight = useAppSelector(state => state.ui.paneConfiguration.bottomPaneHeight);
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);

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
        okText: 'Rollback',
        okHandler: () => {
          Modal.confirm({
            title: 'Are you sure you want to rollback to this revision?',
            content: 'This will trigger a new deployment.',
            okText: 'Rollback',
            onOk: async () => {
              try {
                const result = await runCommandInMainThread(
                  rollbackHelmReleaseCommand({
                    release: release.name,
                    namespace: release.namespace,
                    revision: revision.revision,
                  })
                );
                if (result.stderr) {
                  dispatch(setAlert(errorAlert("Couldn't rollback Helm release", result.stderr)));
                  trackEvent('helm_release/rollback', {status: 'failed'});
                } else {
                  dispatch(setAlert(successAlert("Helm release rollbacked successfully. Check it's status")));
                  trackEvent('helm_release/rollback', {status: 'succeeded'});
                }
              } catch (e: any) {
                setAlert;
                dispatch(setAlert(errorAlert("Couldn't rollback Helm release", e.message)));
                trackEvent('helm_release/rollback', {status: 'failed'});
              }
            },
            onCancel: () => {
              trackEvent('helm_release/rollback', {status: 'canceled'});
            },
          });
        },
      });
      trackEvent('helm_release/revision_diff');
    },
    [release, setHelmReleaseDiff, dispatch]
  );

  const columns = useMemo(() => createTableColumns(release, onDiffClickHandler), [release, onDiffClickHandler]);
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
    <div style={{height: '100%'}}>
      <Typography.Text>Review this Chart updates history below.</Typography.Text>
      <Table
        sticky
        rowKey="revision"
        dataSource={value}
        columns={columns}
        pagination={false}
        loading={loading}
        scroll={{y: height - 300 - (bottomSelection === 'terminal' ? terminalHeight : 0)}}
      />
    </div>
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
