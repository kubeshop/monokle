import {Popover, Tag} from 'antd';

import {DateTime} from 'luxon';

import {ResourceRefsIconPopover} from '@components/molecules';
import ErrorsPopoverContent from '@components/molecules/ValidationErrorsPopover/ErrorsPopoverContent';

import {timeAgo} from '@utils/timeAgo';
import {convertBytesToGigabyte, memoryParser} from '@utils/unit-converter';

import {K8sResource} from '@shared/models/k8sResource';
import {isDefined} from '@shared/utils/filter';

import * as S from './TableCells.styled';

const UNSORTED_VALUE = -9999999;

export const CellStatus = {
  title: 'Status',
  dataIndex: 'content',
  key: 'status',
  width: '120px',
  render: (content: any) => (
    <div>
      {(content?.status?.phase === 'Running' && <S.StatusRunning>{content?.status?.phase}</S.StatusRunning>) ||
        (content?.status?.phase === 'Bound' && <S.StatusRunning>{content?.status?.phase}</S.StatusRunning>) ||
        (content?.status?.phase === 'Pending' && <S.StatusPending>{content?.status?.phase}</S.StatusPending>) ||
        (content?.status?.phase === 'Terminating' && (
          <S.StatusTerminating>{content?.status?.phase}</S.StatusTerminating>
        )) ||
        (content?.status?.phase === 'Active' && <S.StatusActive>{content?.status?.phase}</S.StatusActive>) ||
        (content?.status?.phase ? <Tag color="magenta">{content?.status?.phase}</Tag> : <span>-</span>)}
    </div>
  ),
  sorter: (a: K8sResource, b: K8sResource) => a.content?.status?.phase?.localeCompare(b.content?.status?.phase),
};

export const CellAge = {
  title: 'Age',
  dataIndex: 'content',
  key: 'age',
  width: '120px',
  render: ({metadata: {creationTimestamp}}: any) => <div>{timeAgo(creationTimestamp)}</div>,
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
  defaultSortOrder: 'ascend',
};

export const CellNamespace = {
  title: 'Namespace',
  dataIndex: 'namespace',
  key: 'namespace',
  width: '150px',
  render: (namespace: string) => <div>{namespace}</div>,
  sorter: (a: K8sResource, b: K8sResource) => a?.namespace?.localeCompare(b?.namespace || '') || UNSORTED_VALUE,
};

export const CellNode = {
  title: 'Node',
  dataIndex: 'content',
  key: 'node',
  width: '240px',
  render: (content: any) => <div>{content?.spec?.nodeName}</div>,
  sorter: (a: K8sResource, b: K8sResource) =>
    a?.content?.spec?.nodeName?.localeCompare(b?.content?.spec?.nodeName || '') || UNSORTED_VALUE,
};

export const CellError = {
  title: 'Errors',
  dataIndex: '',
  key: 'error',
  width: '150px',
  render: (resource: K8sResource) =>
    !((resource.validation && !resource.validation?.isValid) || (resource.issues && !resource.issues?.isValid)) ? (
      <span style={{padding: '2px 4px'}}>-</span>
    ) : (
      <Popover mouseEnterDelay={0.5} placement="rightTop" content={<ErrorsPopoverContent resource={resource} />}>
        <S.ErrorCell>
          {Number(resource.validation?.errors ? resource.validation?.errors?.length : 0) +
            Number(resource.issues?.errors ? resource.issues?.errors?.length : 0)}
        </S.ErrorCell>
      </Popover>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(Number(a.validation?.errors?.length) + Number(a.issues?.errors?.length)) -
      Number(Number(b.validation?.errors?.length) + Number(b.issues?.errors?.length)) || UNSORTED_VALUE,
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
    content?.status?.containerStatuses ? (
      <span style={{padding: '2px 4px'}}>{content?.status?.containerStatuses[0]?.restartCount || 0}</span>
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    a.content?.status?.containerStatuses && a.content?.status?.containerStatuses
      ? Number(a.content?.status?.containerStatuses[0].restartCount) -
        Number(b.content?.status?.containerStatuses[0].restartCount)
      : UNSORTED_VALUE,
};

export const CellPodsCount = {
  title: 'Pods',
  dataIndex: 'content',
  key: 'pods',
  width: '120px',
  render: (content: any) => (
    <span style={{padding: '2px 4px'}}>
      {content?.status?.availableReplicas || 0} / {content?.status?.replicas || 0}
    </span>
  ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(a.content?.status?.availableReplicas) - Number(b.content?.status?.availableReplicas) || UNSORTED_VALUE,
};

export const CellScheduledCount = {
  title: 'Scheduled',
  dataIndex: 'content',
  key: 'scheduled',
  width: '120px',
  render: (content: any) => (
    <span style={{padding: '2px 4px'}}>
      {content?.status?.currentNumberScheduled || 0} / {content?.status?.desiredNumberScheduled || 0}
    </span>
  ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(a.content?.status?.currentNumberScheduled) - Number(b.content?.status?.currentNumberScheduled) ||
    UNSORTED_VALUE,
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
    a?.content?.spec?.type?.localeCompare(b?.content?.spec?.type || '') || UNSORTED_VALUE,
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
    Number(a?.content?.spec?.ports?.length) - Number(b?.content?.spec?.ports?.length) || UNSORTED_VALUE,
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
    Number(a?.content?.spec?.clusterIPs.length) - Number(b?.content?.spec?.clusterIPs.length) || UNSORTED_VALUE,
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
    Number(a?.content?.subsets?.length) - Number(b?.content?.subsets?.length) || UNSORTED_VALUE,
};

export const LoadBalancerIPs = {
  title: 'LoadBalancers',
  dataIndex: 'content',
  key: 'loadbalancers',
  width: '150px',
  render: (content: any) =>
    content?.status?.loadBalancer?.ingress ? (
      content?.status?.loadBalancer?.ingress.map((data: {ip: string}) => (
        <div key={data.ip} style={{padding: '2px 4px'}}>
          {data.ip}
        </div>
      ))
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(a?.content?.status?.loadBalancer?.ingress?.length) -
      Number(b?.content?.status?.loadBalancer?.ingress?.length) || UNSORTED_VALUE,
};

export const CellSecretType = {
  title: 'Type',
  dataIndex: 'content',
  key: 'secrettype',
  width: '150px',
  render: (content: any) =>
    content?.type ? (
      <span style={{padding: '2px 4px'}}>{content?.type}</span>
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) => a?.content?.type?.localeCompare(b?.content?.type || '') || UNSORTED_VALUE,
};

export const CellAddresses = {
  title: 'Addresses',
  dataIndex: 'content',
  key: 'addresses',
  width: '240px',
  render: (content: any) =>
    content?.status?.addresses ? (
      content?.status?.addresses.map((data: {address: string; type: string}) => (
        <div key={data.type + data.address} style={{padding: '2px 4px'}}>
          {data.type}: {data.address}
        </div>
      ))
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(a?.content?.status?.addresses?.length) - Number(b?.content?.status?.addresses?.length) || UNSORTED_VALUE,
};

export const CellNodeOS = {
  title: 'Operating System',
  dataIndex: 'content',
  key: 'nodeOS',
  width: '288px',
  render: (content: any) => (
    <div>
      {content?.status?.nodeInfo?.operatingSystem &&
        content?.status?.nodeInfo?.osImage &&
        content?.status?.nodeInfo?.architecture && (
          <div>
            <span>{content?.status?.nodeInfo?.operatingSystem}, </span>
            <span>{content?.status?.nodeInfo?.architecture}, </span>
            <span>{content?.status?.nodeInfo?.osImage}</span>
          </div>
        )}
    </div>
  ),
  sorter: (a: K8sResource, b: K8sResource) =>
    a?.content?.status?.nodeInfo?.operatingSystem?.localeCompare(b?.content?.status?.nodeInfo?.operatingSystem || '') ||
    UNSORTED_VALUE,
};

export const CellNodeKubelet = {
  title: 'Kubelet',
  dataIndex: 'content',
  key: 'nodeKubelet',
  width: '180px',
  render: (content: any) => <div>{content?.status?.nodeInfo?.kubeletVersion || '-'}</div>,
  sorter: (a: K8sResource, b: K8sResource) =>
    a?.content?.status?.nodeInfo?.kubeletVersion?.localeCompare(b?.content?.status?.nodeInfo?.kubeletVersion || '') ||
    UNSORTED_VALUE,
};

export const CellNodeKernel = {
  title: 'Kernel',
  dataIndex: 'content',
  key: 'nodeKernel',
  width: '180px',
  render: (content: any) => <div>{content?.status?.nodeInfo?.kernelVersion || '-'}</div>,
  sorter: (a: K8sResource, b: K8sResource) =>
    a?.content?.status?.nodeInfo?.kernelVersion.localeCompare(b?.content?.status?.nodeInfo?.kernelVersion || '') ||
    UNSORTED_VALUE,
};

export const CellNodeContainerRuntime = {
  title: 'ContainerRuntime',
  dataIndex: 'content',
  key: 'containerRuntime',
  width: '180px',
  render: (content: any) => <div>{content?.status?.nodeInfo?.containerRuntimeVersion || '-'}</div>,
  sorter: (a: K8sResource, b: K8sResource) =>
    a?.content?.status?.nodeInfo?.containerRuntimeVersion.localeCompare(
      b?.content?.status?.nodeInfo?.containerRuntimeVersion || ''
    ) || UNSORTED_VALUE,
};

export const CellNodeRoles = {
  title: 'Roles',
  dataIndex: 'content',
  key: 'nodeRoles',
  width: '210px',
  render: (content: any) =>
    content?.metadata?.labels ? (
      <div>
        {isDefined(content?.metadata?.labels['node-role.kubernetes.io/master']) && <span>master</span>}
        {isDefined(content?.metadata?.labels['node-role.kubernetes.io/control-plane']) && (
          <span>{isDefined(content?.metadata?.labels['node-role.kubernetes.io/master']) && ', '}control-plane</span>
        )}
        {!isDefined(content?.metadata?.labels['node-role.kubernetes.io/master']) &&
          !isDefined(content?.metadata?.labels['node-role.kubernetes.io/control-plane']) && <span>-</span>}
      </div>
    ) : (
      <div>-</div>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    a?.content?.metadata?.labels['node-role.kubernetes.io/control-plane']?.localeCompare(
      b?.content?.metadata?.labels['node-role.kubernetes.io/control-plane'] || ''
    ) || UNSORTED_VALUE,
};

export const CellStorageCapacity = {
  title: 'Capacity',
  dataIndex: 'content',
  key: 'storageCapacity',
  width: '120px',
  render: (content: any) =>
    content?.status?.capacity?.storage ? (
      <div>{convertBytesToGigabyte(memoryParser(content?.status?.capacity?.storage))}GB</div>
    ) : (
      <div>-</div>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(a?.content?.status?.capacity?.storage) - Number(b?.content?.status?.capacity?.storage) || UNSORTED_VALUE,
};
