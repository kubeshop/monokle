import {Tag} from 'antd';

import {DateTime} from 'luxon';

import * as S from './TableCells.styled';

export const CellStatus = {
  title: 'Status',
  dataIndex: 'content',
  key: 'status',
  width: '120px',
  render: (content: any) => (
    <div>
      {content?.status?.phase === 'Running' && <S.StatusCell>{content?.status?.phase}</S.StatusCell>}
      {content?.status?.phase !== 'Running' && <Tag color="magenta">{content?.status?.phase}</Tag>}
    </div>
  ),
};

export const CellAge = {
  title: 'Age',
  dataIndex: 'content',
  key: 'age',
  width: '120px',
  render: ({metadata: {creationTimestamp}}: any) => (
    <div>{DateTime.fromISO(creationTimestamp).toRelative({style: 'short', unit: 'days'})}</div>
  ),
};

export const CellName = {
  title: 'Name',
  dataIndex: 'name',
  key: 'name',
  render: (name: string) => <div>{name}</div>,
};

export const CellNamespace = {
  title: 'Namespace',
  dataIndex: 'namespace',
  key: 'namespace',
  render: (namespace: string) => <div>{namespace}</div>,
};

export const CellNode = {
  title: 'Node',
  dataIndex: 'content',
  key: 'node',
  render: (content: any) => <S.NodeCell>{content?.spec?.nodeName}</S.NodeCell>,
};
