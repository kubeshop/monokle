import {Tag} from 'antd';

import {DateTime} from 'luxon';

import {K8sResource} from '@models/k8sresource';

import {ResourceRefsIconPopover} from '@components/molecules';

import * as S from './TableCells.styled';

export const CellStatus = {
  title: 'Status',
  dataIndex: 'content',
  key: 'status',
  width: '120px',
  render: (content: any) => (
    <div>
      {(content?.status?.phase === 'Running' && <S.StatusRunning>{content?.status?.phase}</S.StatusRunning>) ||
        (content?.status?.phase === 'Terminating' && (
          <S.StatuTerminating>{content?.status?.phase}</S.StatuTerminating>
        )) ||
        (content?.status?.phase === 'Active' && <S.StatusActive>{content?.status?.phase}</S.StatusActive>) || (
          <Tag color="magenta">{content?.status?.phase}</Tag>
        )}
    </div>
  ),
  sorter: (a: K8sResource, b: K8sResource) => a.content.status.phase.localeCompare(b.content.status.phase),
};

export const CellAge = {
  title: 'Age',
  dataIndex: 'content',
  key: 'age',
  width: '120px',
  render: ({metadata: {creationTimestamp}}: any) => (
    <div>{DateTime.fromISO(creationTimestamp).toRelative({style: 'short', unit: 'days'})}</div>
  ),
  sorter: (a: K8sResource, b: K8sResource) =>
    DateTime.fromISO(a.content.metadata?.creationTimestamp).toMillis() -
    DateTime.fromISO(b.content.metadata?.creationTimestamp).toMillis(),
};

export const CellName = {
  title: 'Name',
  dataIndex: '',
  key: 'name',
  width: '400px',
  render: (resource: K8sResource) => (
    <div style={{display: 'flex'}}>
      <ResourceRefsIconPopover isSelected={false} isDisabled={false} resource={resource} type="incoming" />
      <div>{resource.name}</div>
      <ResourceRefsIconPopover isSelected={false} isDisabled={false} resource={resource} type="outgoing" />
    </div>
  ),
  sorter: (a: K8sResource, b: K8sResource) => a.name.localeCompare(b.name),
};

export const CellNamespace = {
  title: 'Namespace',
  dataIndex: 'namespace',
  key: 'namespace',
  width: '150px',
  render: (namespace: string) => <div>{namespace}</div>,
  sorter: (a: K8sResource, b: K8sResource) => a?.namespace?.localeCompare(b?.namespace || '') || -Infinity,
};

export const CellNode = {
  title: 'Node',
  dataIndex: 'content',
  key: 'node',
  width: '240px',
  render: (content: any) => <S.NodeCell>{content?.spec?.nodeName}</S.NodeCell>,
  sorter: (a: K8sResource, b: K8sResource) =>
    a?.content?.spec?.nodeName?.localeCompare(b?.content?.spec?.nodeName || '') || -Infinity,
};

export const CellError = {
  title: 'Errors',
  dataIndex: 'validation',
  key: 'error',
  width: '150px',
  render: (validation: any) =>
    !(validation && !validation?.isValid && validation?.errors && validation?.errors.length > 0) ? (
      <span style={{padding: '2px 4px'}}>-</span>
    ) : (
      <S.ErrorCell>{validation?.errors.length}</S.ErrorCell>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(a.validation?.errors.length) - Number(b.validation?.errors.length) || -Infinity,
};

export const CellLabels = {
  title: 'Labels',
  dataIndex: 'content',
  width: '400px',
  key: 'labels',
  render: (content: any) =>
    content.metadata.labels ? (
      Object.keys(content.metadata.labels).map(key => (
        <div key={key + content.metadata.labels[key]}>
          <Tag color="geekblue">
            {key}={content.metadata.labels[key]}
          </Tag>
        </div>
      ))
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Object.keys(a.content.metadata.labels).length - Object.keys(b.content.metadata.labels).length,
};

export const CellRestartCount = {
  title: 'Restarts',
  dataIndex: 'content',
  key: 'restarts',
  width: '120px',
  render: (content: any) =>
    content?.status?.containerStatuses[0] ? (
      <span style={{padding: '2px 4px'}}>{content?.status?.containerStatuses[0]?.restartCount}</span>
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(a.content?.status?.containerStatuses[0].restartCount) -
      Number(b.content?.status?.containerStatuses[0].restartCount) || -Infinity,
};

export const CellPodsCount = {
  title: 'Pods',
  dataIndex: 'content',
  key: 'pods',
  render: (content: any) => (
    <span style={{padding: '2px 4px'}}>
      {content?.status?.availableReplicas || 0} / {content?.status?.replicas}
    </span>
  ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(a.content?.status?.availableReplicas) - Number(b.content?.status?.availableReplicas) || -Infinity,
};

export const CellScheduledCount = {
  title: 'Scheduled',
  dataIndex: 'content',
  key: 'scheduled',
  width: '120px',
  render: (content: any) => (
    <span style={{padding: '2px 4px'}}>
      {content?.status?.currentNumberScheduled} / {content?.status?.desiredNumberScheduled}
    </span>
  ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(a.content?.status?.currentNumberScheduled) - Number(b.content?.status?.currentNumberScheduled) || -Infinity,
};

export const CellType = {
  title: 'Type',
  dataIndex: 'content',
  key: 'type',
  width: '150px',
  render: (content: any) =>
    content?.spec?.type ? (
      <span style={{padding: '2px 4px'}}>{content?.spec?.type}</span>
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    a?.content?.spec?.type?.localeCompare(b?.content?.spec?.type || '') || -Infinity,
};

export const CellPorts = {
  title: 'Ports',
  dataIndex: 'content',
  key: 'ports',
  width: '150px',
  render: (content: any) =>
    content?.spec?.ports ? (
      content?.spec?.ports.map((data: {port: number; protocol: string}) => (
        <div key={data.port + data.protocol} style={{padding: '2px 4px'}}>
          {data.port}/{data.protocol}
        </div>
      ))
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(a?.content?.spec?.ports.length) - Number(b?.content?.spec?.ports.length) || -Infinity,
};

export const CellIPs = {
  title: 'IPs',
  dataIndex: 'content',
  key: 'ips',
  width: '150px',
  render: (content: any) =>
    content?.spec?.clusterIPs ? (
      content?.spec?.clusterIPs.map((data: string) => (
        <div key={data} style={{padding: '2px 4px'}}>
          {data}
        </div>
      ))
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(a?.content?.spec?.clusterIPs.length) - Number(b?.content?.spec?.clusterIPs.length) || -Infinity,
};

export const CellEndpoints = {
  title: 'Endpoints',
  dataIndex: 'content',
  key: 'endpoints',
  width: '240px',
  render: (content: any) =>
    content?.subsets ? (
      content?.subsets.map(
        (subset: {addresses: Array<{ip: string; nodeName: string}>; ports: Array<{port: number; protocol: string}>}) =>
          subset.addresses && subset.ports ? (
            subset.addresses.map(address =>
              subset.ports.map((port, index: number) => (
                // eslint-disable-next-line react/no-array-index-key
                <div key={address.ip + port.port + index} style={{padding: '2px 4px'}}>
                  {address.ip}:{port.port}
                </div>
              ))
            )
          ) : (
            <span style={{padding: '2px 4px'}}>-</span>
          )
      )
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(a?.content?.subsets?.length) - Number(b?.content?.subsets?.length) || -Infinity,
};
